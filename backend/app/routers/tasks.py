"""
Task endpoints router.

API routes for task CRUD operations with JWT authentication.
"""
from datetime import datetime
from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import select

from app.auth import get_current_user
from app.dependencies import SessionDep
from app.models.task import Task
from app.schemas.task import TaskCreate, TaskResponse, TaskUpdate

router = APIRouter()


@router.get("/{user_id}/tasks", response_model=List[TaskResponse])
def get_all_tasks(
    user_id: str,
    session: SessionDep,
    authenticated_user: str = Depends(get_current_user),
) -> List[Task]:
    """
    Get all tasks for a specific user (requires authentication).

    Args:
        user_id: The ID of the user whose tasks to retrieve
        session: Database session (injected by FastAPI)
        authenticated_user: User ID extracted from JWT token

    Returns:
        List of tasks belonging to the authenticated user (empty list if none)

    Raises:
        401 Unauthorized: If JWT token is missing, invalid, or expired
        403 Forbidden: If authenticated_user doesn't match requested user_id

    User Story: US1 - View All Tasks [P1]
    """
    # Ownership validation: ensure authenticated user matches requested user_id
    if authenticated_user != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Cannot access resources for user {user_id}",
        )

    # Use authenticated_user from JWT (zero trust in URL parameter)
    statement = select(Task).where(Task.user_id == authenticated_user)
    tasks = session.exec(statement).all()
    return tasks


@router.get("/{user_id}/tasks/{id}", response_model=TaskResponse)
def get_task_by_id(
    user_id: str,
    id: int,
    session: SessionDep,
    authenticated_user: str = Depends(get_current_user),
) -> Task:
    """
    Get a specific task by ID (requires authentication).

    Args:
        user_id: The ID of the user who owns the task
        id: The task ID to retrieve
        session: Database session (injected by FastAPI)
        authenticated_user: User ID extracted from JWT token

    Returns:
        The requested task with complete details

    Raises:
        401 Unauthorized: If JWT token is missing, invalid, or expired
        403 Forbidden: If authenticated_user doesn't match requested user_id
        404 Not Found: If task doesn't exist or belongs to different user

    User Story: US3 - View Single Task [P2]
    """
    # Ownership validation: ensure authenticated user matches requested user_id
    if authenticated_user != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Cannot access resources for user {user_id}",
        )

    # Query task by id AND authenticated_user (zero trust in URL parameter)
    statement = select(Task).where(Task.id == id, Task.user_id == authenticated_user)
    task = session.exec(statement).first()

    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Task {id} not found for user {authenticated_user}",
        )

    return task


@router.post(
    "/{user_id}/tasks",
    response_model=TaskResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_task(
    user_id: str,
    task_data: TaskCreate,
    session: SessionDep,
    authenticated_user: str = Depends(get_current_user),
) -> Task:
    """
    Create a new task for a specific user (requires authentication).

    Args:
        user_id: The ID of the user who will own the task
        task_data: Task creation data (title and optional description)
        session: Database session (injected by FastAPI)
        authenticated_user: User ID extracted from JWT token

    Returns:
        The newly created task with generated ID and timestamps

    Raises:
        400 Bad Request: If validation fails (empty title, etc.)
        401 Unauthorized: If JWT token is missing, invalid, or expired
        403 Forbidden: If authenticated_user doesn't match requested user_id

    User Story: US2 - Create New Task [P1]
    """
    # Ownership validation: ensure authenticated user matches requested user_id
    if authenticated_user != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Cannot access resources for user {user_id}",
        )

    # Create new Task instance with user_id from JWT (zero trust in URL parameter)
    new_task = Task(
        title=task_data.title,
        description=task_data.description,
        user_id=authenticated_user,
    )

    # Add to session and commit
    session.add(new_task)
    session.commit()
    session.refresh(new_task)

    return new_task


@router.patch("/{user_id}/tasks/{id}/complete", response_model=TaskResponse)
def toggle_task_completion(
    user_id: str,
    id: int,
    session: SessionDep,
    authenticated_user: str = Depends(get_current_user),
) -> Task:
    """
    Toggle the completion status of a task (requires authentication).

    Args:
        user_id: The ID of the user who owns the task
        id: The task ID to toggle
        session: Database session (injected by FastAPI)
        authenticated_user: User ID extracted from JWT token

    Returns:
        The updated task with toggled is_completed and refreshed updated_at

    Raises:
        401 Unauthorized: If JWT token is missing, invalid, or expired
        403 Forbidden: If authenticated_user doesn't match requested user_id
        404 Not Found: If task doesn't exist or belongs to different user

    User Story: US6 - Toggle Completion [P1]
    """
    # Ownership validation: ensure authenticated user matches requested user_id
    if authenticated_user != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Cannot access resources for user {user_id}",
        )

    # Query task by id AND authenticated_user (zero trust in URL parameter)
    statement = select(Task).where(Task.id == id, Task.user_id == authenticated_user)
    task = session.exec(statement).first()

    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Task {id} not found for user {authenticated_user}",
        )

    # Toggle completion status
    task.is_completed = not task.is_completed

    # Update timestamp
    task.updated_at = datetime.utcnow()

    # Commit changes
    session.add(task)
    session.commit()
    session.refresh(task)

    return task


@router.put("/{user_id}/tasks/{id}", response_model=TaskResponse)
def update_task(
    user_id: str,
    id: int,
    task_data: TaskUpdate,
    session: SessionDep,
    authenticated_user: str = Depends(get_current_user),
) -> Task:
    """
    Update an existing task (requires authentication).

    Args:
        user_id: The ID of the user who owns the task
        id: The task ID to update
        task_data: Updated task data (all fields optional)
        session: Database session (injected by FastAPI)
        authenticated_user: User ID extracted from JWT token

    Returns:
        The updated task with refreshed updated_at timestamp

    Raises:
        400 Bad Request: If validation fails (empty title, etc.)
        401 Unauthorized: If JWT token is missing, invalid, or expired
        403 Forbidden: If authenticated_user doesn't match requested user_id
        404 Not Found: If task doesn't exist or belongs to different user

    User Story: US4 - Update Task [P2]
    """
    # Ownership validation: ensure authenticated user matches requested user_id
    if authenticated_user != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Cannot access resources for user {user_id}",
        )

    # Query task by id AND authenticated_user (zero trust in URL parameter)
    statement = select(Task).where(Task.id == id, Task.user_id == authenticated_user)
    task = session.exec(statement).first()

    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Task {id} not found for user {authenticated_user}",
        )

    # Update only provided fields
    if task_data.title is not None:
        task.title = task_data.title
    if task_data.description is not None:
        task.description = task_data.description
    if task_data.is_completed is not None:
        task.is_completed = task_data.is_completed

    # Always refresh updated_at timestamp
    task.updated_at = datetime.utcnow()

    # Commit changes
    session.add(task)
    session.commit()
    session.refresh(task)

    return task


@router.delete("/{user_id}/tasks/{id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_task(
    user_id: str,
    id: int,
    session: SessionDep,
    authenticated_user: str = Depends(get_current_user),
) -> None:
    """
    Delete a task permanently (requires authentication).

    Args:
        user_id: The ID of the user who owns the task
        id: The task ID to delete
        session: Database session (injected by FastAPI)
        authenticated_user: User ID extracted from JWT token

    Returns:
        None (204 No Content on success)

    Raises:
        401 Unauthorized: If JWT token is missing, invalid, or expired
        403 Forbidden: If authenticated_user doesn't match requested user_id
        404 Not Found: If task doesn't exist or belongs to different user

    User Story: US5 - Delete Task [P3]
    """
    # Ownership validation: ensure authenticated user matches requested user_id
    if authenticated_user != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Cannot access resources for user {user_id}",
        )

    # Query task by id AND authenticated_user (zero trust in URL parameter)
    statement = select(Task).where(Task.id == id, Task.user_id == authenticated_user)
    task = session.exec(statement).first()

    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Task {id} not found for user {authenticated_user}",
        )

    # Delete task
    session.delete(task)
    session.commit()
