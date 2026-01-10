"""
Task database model.

SQLModel table definition for the tasks table.
"""
from datetime import datetime
from typing import Optional

from sqlmodel import Field, SQLModel


class Task(SQLModel, table=True):
    """
    Task entity representing a todo item.

    Attributes:
        id: Auto-incrementing primary key
        title: Task title (required, max 255 chars)
        description: Optional detailed description
        is_completed: Completion status (defaults to False)
        created_at: Timestamp when task was created
        updated_at: Timestamp when task was last modified
        user_id: ID of the user who owns this task (for multi-user isolation)
    """

    __tablename__ = "tasks"

    id: Optional[int] = Field(default=None, primary_key=True)
    title: str = Field(max_length=255, nullable=False)
    description: Optional[str] = Field(default=None)
    is_completed: bool = Field(default=False)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    user_id: str = Field(nullable=False, index=True)
