"""
Task API schemas.

Pydantic models for request/response validation.
"""
from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field, field_validator


class TaskCreate(BaseModel):
    """
    Schema for creating a new task.

    Attributes:
        title: Task title (required, 1-255 chars)
        description: Optional detailed description
    """

    title: str = Field(min_length=1, max_length=255)
    description: Optional[str] = None

    @field_validator("title")
    @classmethod
    def title_must_not_be_empty(cls, v: str) -> str:
        """Validate that title is not just whitespace."""
        if not v.strip():
            raise ValueError("Title cannot be empty or whitespace only")
        return v.strip()


class TaskUpdate(BaseModel):
    """
    Schema for updating an existing task.

    All fields are optional - only provided fields will be updated.

    Attributes:
        title: New task title (optional, 1-255 chars)
        description: New description (optional)
        is_completed: New completion status (optional)
    """

    title: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = None
    is_completed: Optional[bool] = None

    @field_validator("title")
    @classmethod
    def title_must_not_be_empty(cls, v: Optional[str]) -> Optional[str]:
        """Validate that title is not just whitespace if provided."""
        if v is not None and not v.strip():
            raise ValueError("Title cannot be empty or whitespace only")
        return v.strip() if v is not None else None


class TaskResponse(BaseModel):
    """
    Schema for task responses.

    Represents a task as returned by the API.

    Attributes:
        id: Task ID
        title: Task title
        description: Task description (may be null)
        is_completed: Completion status
        created_at: Creation timestamp
        updated_at: Last modification timestamp
        user_id: ID of the user who owns this task
    """

    id: int
    title: str
    description: Optional[str]
    is_completed: bool
    created_at: datetime
    updated_at: datetime
    user_id: str

    class Config:
        """Pydantic configuration."""

        from_attributes = True  # Enable ORM mode for SQLModel compatibility
