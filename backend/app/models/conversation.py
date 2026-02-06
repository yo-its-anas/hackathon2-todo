"""
Conversation database model.

SQLModel table definition for chat conversations.
"""
from datetime import datetime
from typing import Optional, List, TYPE_CHECKING

from sqlmodel import Field, SQLModel, Relationship

if TYPE_CHECKING:
    from app.models.message import Message


class Conversation(SQLModel, table=True):
    """
    Chat conversation session for a user.

    Attributes:
        id: Auto-incrementing primary key
        user_id: ID of the user who owns this conversation
        created_at: Timestamp when conversation was created
        updated_at: Timestamp when conversation was last active
    """

    __tablename__ = "conversations"

    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: str = Field(nullable=False, index=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    messages: List["Message"] = Relationship(back_populates="conversation")
