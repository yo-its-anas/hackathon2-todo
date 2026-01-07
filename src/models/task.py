"""Task model for the todo application."""
from dataclasses import dataclass


@dataclass
class Task:
    """Represents a single todo item.

    Attributes:
        id: Unique integer identifier (auto-assigned, immutable)
        title: Task title (required, 1-200 characters)
        description: Optional task description (0-1000 characters)
        is_completed: Completion status (True=completed, False=pending)
    """
    id: int
    title: str
    description: str
    is_completed: bool
