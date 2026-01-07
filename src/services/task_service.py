"""Task management service - business logic and in-memory storage."""
from typing import List
from src.models.task import Task


# Custom Exceptions
class TaskNotFoundError(Exception):
    """Raised when a task with the given ID does not exist."""
    pass


class ValidationError(Exception):
    """Raised when task data validation fails."""
    pass


# In-memory storage
_tasks: dict[int, Task] = {}
_next_task_id: int = 1


def create_task(title: str, description: str = "") -> Task:
    """Create a new task with validation.

    Args:
        title: Task title (required, 1-200 characters after stripping)
        description: Task description (optional, 0-1000 characters)

    Returns:
        Created Task object with assigned ID

    Raises:
        ValidationError: If title is empty or exceeds limits
    """
    global _next_task_id

    # Validate title
    title = title.strip()
    if not title:
        raise ValidationError("Task title is required.")
    if len(title) > 200:
        raise ValidationError("Task title must be 200 characters or less.")

    # Validate description
    if len(description) > 1000:
        raise ValidationError("Task description must be 1000 characters or less.")

    # Create task
    task = Task(
        id=_next_task_id,
        title=title,
        description=description,
        is_completed=False
    )

    # Store task
    _tasks[_next_task_id] = task
    _next_task_id += 1

    return task


def get_all_tasks() -> List[Task]:
    """Get all tasks.

    Returns:
        List of all Task objects (may be empty)
    """
    return list(_tasks.values())


def get_task_by_id(task_id: int) -> Task:
    """Get a task by its ID.

    Args:
        task_id: The ID of the task to retrieve

    Returns:
        Task object with the specified ID

    Raises:
        TaskNotFoundError: If no task exists with the given ID
    """
    if task_id not in _tasks:
        raise TaskNotFoundError(f"Task with ID {task_id} not found.")
    return _tasks[task_id]


def toggle_task_status(task_id: int) -> Task:
    """Toggle the completion status of a task.

    Args:
        task_id: The ID of the task to toggle

    Returns:
        Updated Task object with flipped is_completed status

    Raises:
        TaskNotFoundError: If no task exists with the given ID
    """
    task = get_task_by_id(task_id)
    task.is_completed = not task.is_completed
    return task


def update_task(task_id: int, title: str = None, description: str = None) -> Task:
    """Update a task's title and/or description.

    Args:
        task_id: The ID of the task to update
        title: New title (if provided, must be 1-200 chars after stripping)
        description: New description (if provided, must be 0-1000 chars)

    Returns:
        Updated Task object

    Raises:
        TaskNotFoundError: If no task exists with the given ID
        ValidationError: If validation fails for title or description
    """
    task = get_task_by_id(task_id)

    # Validate and update title if provided
    if title is not None:
        title = title.strip()
        if not title:
            raise ValidationError("Task title is required.")
        if len(title) > 200:
            raise ValidationError("Task title must be 200 characters or less.")
        task.title = title

    # Validate and update description if provided
    if description is not None:
        if len(description) > 1000:
            raise ValidationError("Task description must be 1000 characters or less.")
        task.description = description

    return task


def delete_task(task_id: int) -> None:
    """Delete a task by its ID.

    Args:
        task_id: The ID of the task to delete

    Raises:
        TaskNotFoundError: If no task exists with the given ID
    """
    # Verify task exists before deleting
    get_task_by_id(task_id)
    del _tasks[task_id]
