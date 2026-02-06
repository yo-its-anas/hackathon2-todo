"""
MCP tool implementations.

Task management tools exposed via FastMCP for AI agent consumption.
All tools use anyio.to_thread.run_sync to avoid blocking the async event loop.
"""
import logging
from typing import Optional, List, Tuple

import anyio
from sqlmodel import Session, select

from app.models.task import Task
from app.mcp.server import mcp
from app.database import engine

logger = logging.getLogger(__name__)


def _find_matching_tasks_sync(
    user_id: str, identifier: str
) -> Tuple[List[dict], str]:
    """
    Sync helper: Find tasks matching a search identifier by title substring.
    Returns serializable dicts, not ORM objects.
    """
    identifier_lower = identifier.lower()

    with Session(engine) as session:
        # Get all user's incomplete tasks that match
        statement = select(Task).where(
            Task.user_id == user_id,
            Task.is_completed == False,  # noqa: E712
        )
        tasks = list(session.exec(statement).all())

        # Filter by title containing identifier (case-insensitive)
        matching = [t for t in tasks if identifier_lower in t.title.lower()]

        if not matching:
            # Also check completed tasks
            statement = select(Task).where(Task.user_id == user_id)
            all_tasks = list(session.exec(statement).all())
            matching = [t for t in all_tasks if identifier_lower in t.title.lower()]

        if not matching:
            return [], "TASK_NOT_FOUND"

        if len(matching) > 1:
            # Check for exact match first
            exact = [t for t in matching if t.title.lower() == identifier_lower]
            if len(exact) == 1:
                return [{"id": exact[0].id, "title": exact[0].title, "description": exact[0].description, "is_completed": exact[0].is_completed}], ""
            return [{"id": t.id, "title": t.title, "description": t.description, "is_completed": t.is_completed} for t in matching], "AMBIGUOUS_MATCH"

        t = matching[0]
        return [{"id": t.id, "title": t.title, "description": t.description, "is_completed": t.is_completed}], ""


def _add_task_sync(user_id: str, title: str, description: Optional[str]) -> dict:
    """Sync helper: Add a task to the database."""
    with Session(engine) as session:
        task = Task(
            user_id=user_id,
            title=title[:255],
            description=description,
        )
        session.add(task)
        session.commit()
        session.refresh(task)

        return {
            "success": True,
            "task": {
                "id": task.id,
                "title": task.title,
                "description": task.description,
                "is_completed": task.is_completed,
                "created_at": task.created_at.isoformat(),
            },
            "message": f"Created task: {task.title}",
        }


def _list_tasks_sync(user_id: str, include_completed: bool) -> dict:
    """Sync helper: List tasks from the database."""
    with Session(engine) as session:
        statement = select(Task).where(Task.user_id == user_id)
        if not include_completed:
            statement = statement.where(Task.is_completed == False)  # noqa: E712
        statement = statement.order_by(Task.created_at.desc())

        tasks = list(session.exec(statement).all())

        task_list = [
            {
                "id": t.id,
                "title": t.title,
                "description": t.description,
                "is_completed": t.is_completed,
                "created_at": t.created_at.isoformat(),
            }
            for t in tasks
        ]

        if not tasks:
            message = "You have no tasks yet. Would you like to add one?"
        else:
            pending = sum(1 for t in tasks if not t.is_completed)
            completed = len(tasks) - pending
            message = f"You have {len(tasks)} task(s): {pending} pending, {completed} completed."

        return {
            "success": True,
            "tasks": task_list,
            "count": len(tasks),
            "message": message,
        }


def _complete_task_sync(user_id: str, task_identifier: str) -> dict:
    """Sync helper: Mark a task as completed."""
    from datetime import datetime

    with Session(engine) as session:
        # Find matching tasks
        identifier_lower = task_identifier.lower()
        statement = select(Task).where(Task.user_id == user_id)
        all_tasks = list(session.exec(statement).all())
        matching = [t for t in all_tasks if identifier_lower in t.title.lower()]

        if not matching:
            return {
                "success": False,
                "task": None,
                "error": {
                    "code": "TASK_NOT_FOUND",
                    "message": f"No task found matching '{task_identifier}'. Use list_tasks to see your tasks.",
                },
            }

        if len(matching) > 1:
            exact = [t for t in matching if t.title.lower() == identifier_lower]
            if len(exact) == 1:
                matching = exact
            else:
                return {
                    "success": False,
                    "task": None,
                    "error": {
                        "code": "AMBIGUOUS_MATCH",
                        "message": f"Multiple tasks match '{task_identifier}'. Please be more specific.",
                        "matches": [{"id": t.id, "title": t.title, "is_completed": t.is_completed} for t in matching],
                    },
                }

        task = matching[0]

        if task.is_completed:
            return {
                "success": True,
                "task": {"id": task.id, "title": task.title, "is_completed": task.is_completed},
                "message": f"Task '{task.title}' is already completed.",
            }

        task.is_completed = True
        task.updated_at = datetime.utcnow()
        session.add(task)
        session.commit()
        session.refresh(task)

        return {
            "success": True,
            "task": {"id": task.id, "title": task.title, "is_completed": task.is_completed},
            "message": f"Completed task: {task.title}",
        }


def _delete_task_sync(user_id: str, task_identifier: str) -> dict:
    """Sync helper: Delete a task."""
    with Session(engine) as session:
        identifier_lower = task_identifier.lower()
        statement = select(Task).where(Task.user_id == user_id)
        all_tasks = list(session.exec(statement).all())
        matching = [t for t in all_tasks if identifier_lower in t.title.lower()]

        if not matching:
            return {
                "success": False,
                "deleted_task": None,
                "error": {
                    "code": "TASK_NOT_FOUND",
                    "message": f"No task found matching '{task_identifier}'. Use list_tasks to see your tasks.",
                },
            }

        if len(matching) > 1:
            exact = [t for t in matching if t.title.lower() == identifier_lower]
            if len(exact) == 1:
                matching = exact
            else:
                return {
                    "success": False,
                    "deleted_task": None,
                    "error": {
                        "code": "AMBIGUOUS_MATCH",
                        "message": f"Multiple tasks match '{task_identifier}'. Please be more specific.",
                        "matches": [{"id": t.id, "title": t.title, "is_completed": t.is_completed} for t in matching],
                    },
                }

        task = matching[0]
        task_info = {
            "id": task.id,
            "title": task.title,
            "description": task.description,
            "is_completed": task.is_completed,
        }

        session.delete(task)
        session.commit()

        return {
            "success": True,
            "deleted_task": task_info,
            "message": f"Deleted task: {task_info['title']}",
        }


def _update_task_sync(
    user_id: str, task_identifier: str, new_title: Optional[str], new_description: Optional[str]
) -> dict:
    """Sync helper: Update a task."""
    from datetime import datetime

    if not new_title and new_description is None:
        return {
            "success": False,
            "task": None,
            "error": {
                "code": "NO_CHANGES",
                "message": "No changes specified. Provide new_title or new_description.",
            },
        }

    with Session(engine) as session:
        identifier_lower = task_identifier.lower()
        statement = select(Task).where(Task.user_id == user_id)
        all_tasks = list(session.exec(statement).all())
        matching = [t for t in all_tasks if identifier_lower in t.title.lower()]

        if not matching:
            return {
                "success": False,
                "task": None,
                "error": {
                    "code": "TASK_NOT_FOUND",
                    "message": f"No task found matching '{task_identifier}'. Use list_tasks to see your tasks.",
                },
            }

        if len(matching) > 1:
            exact = [t for t in matching if t.title.lower() == identifier_lower]
            if len(exact) == 1:
                matching = exact
            else:
                return {
                    "success": False,
                    "task": None,
                    "error": {
                        "code": "AMBIGUOUS_MATCH",
                        "message": f"Multiple tasks match '{task_identifier}'. Please be more specific.",
                        "matches": [{"id": t.id, "title": t.title, "is_completed": t.is_completed} for t in matching],
                    },
                }

        task = matching[0]

        if new_title:
            task.title = new_title[:255]
        if new_description is not None:
            task.description = new_description

        task.updated_at = datetime.utcnow()
        session.add(task)
        session.commit()
        session.refresh(task)

        return {
            "success": True,
            "task": {
                "id": task.id,
                "title": task.title,
                "description": task.description,
                "is_completed": task.is_completed,
            },
            "message": f"Updated task: {task.title}",
        }


# ============================================================================
# MCP TOOL DEFINITIONS (async wrappers around sync DB operations)
# ============================================================================


@mcp.tool()
async def add_task(user_id: str, title: str, description: Optional[str] = None) -> dict:
    """
    Add a new task for the user.

    Use this when the user wants to create, add, or remember something as a task.

    Args:
        user_id: The authenticated user's ID
        title: The task title (extracted from user message)
        description: Optional detailed description

    Returns:
        dict with success status, created task, and confirmation message
    """
    logger.info(f"MCP tool invoked: add_task, args={{user_id={user_id}, title={title}}}")
    return await anyio.to_thread.run_sync(_add_task_sync, user_id, title, description)


@mcp.tool()
async def list_tasks(user_id: str, include_completed: bool = True) -> dict:
    """
    List all tasks for the user.

    Use this when the user wants to see, view, show, or check their tasks or todo list.

    Args:
        user_id: The authenticated user's ID
        include_completed: Whether to include completed tasks (default True)

    Returns:
        dict with success status, list of tasks, count, and summary message
    """
    logger.info(f"MCP tool invoked: list_tasks, args={{user_id={user_id}, include_completed={include_completed}}}")
    return await anyio.to_thread.run_sync(_list_tasks_sync, user_id, include_completed)


@mcp.tool()
async def complete_task(user_id: str, task_identifier: str) -> dict:
    """
    Mark a task as completed.

    Use this when the user says they finished, completed, done, or checked off a task.

    Args:
        user_id: The authenticated user's ID
        task_identifier: Task title or keyword to match

    Returns:
        dict with success status, completed task, or error information
    """
    logger.info(f"MCP tool invoked: complete_task, args={{user_id={user_id}, task_identifier={task_identifier}}}")
    return await anyio.to_thread.run_sync(_complete_task_sync, user_id, task_identifier)


@mcp.tool()
async def delete_task(user_id: str, task_identifier: str) -> dict:
    """
    Delete/remove a task.

    Use this when the user wants to delete, remove, or get rid of a task.

    Args:
        user_id: The authenticated user's ID
        task_identifier: Task title or keyword to match

    Returns:
        dict with success status, deleted task info, or error information
    """
    logger.info(f"MCP tool invoked: delete_task, args={{user_id={user_id}, task_identifier={task_identifier}}}")
    return await anyio.to_thread.run_sync(_delete_task_sync, user_id, task_identifier)


@mcp.tool()
async def update_task(
    user_id: str,
    task_identifier: str,
    new_title: Optional[str] = None,
    new_description: Optional[str] = None,
) -> dict:
    """
    Update an existing task's title or description.

    Use this when the user wants to change, modify, edit, or rename a task.

    Args:
        user_id: The authenticated user's ID
        task_identifier: Task title or keyword to match
        new_title: New title for the task (optional)
        new_description: New description for the task (optional)

    Returns:
        dict with success status, updated task, or error information
    """
    logger.info(f"MCP tool invoked: update_task, args={{user_id={user_id}, task_identifier={task_identifier}, new_title={new_title}}}")
    return await anyio.to_thread.run_sync(_update_task_sync, user_id, task_identifier, new_title, new_description)
