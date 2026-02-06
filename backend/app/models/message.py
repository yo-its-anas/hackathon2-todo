"""
Message database model.

SQLModel table definition for chat messages within conversations.
"""
from datetime import datetime
from typing import Optional, TYPE_CHECKING

from sqlalchemy import Column, JSON
from sqlmodel import Field, SQLModel, Relationship

if TYPE_CHECKING:
    from app.models.conversation import Conversation


class Message(SQLModel, table=True):
    """
    Individual chat message within a conversation.

    Attributes:
        id: Auto-incrementing primary key
        conversation_id: Foreign key to parent conversation
        user_id: ID of the user who owns this message (denormalized for query perf)
        role: Message role - user | assistant | tool
        content: Message text content
        tool_calls: JSON metadata for tool invocations (when role=assistant)
        created_at: Timestamp when message was created
    """

    __tablename__ = "messages"

    id: Optional[int] = Field(default=None, primary_key=True)
    conversation_id: int = Field(foreign_key="conversations.id", nullable=False)
    user_id: str = Field(nullable=False, index=True)
    role: str = Field(nullable=False)  # user | assistant | tool
    content: str = Field(nullable=False)
    tool_calls: Optional[dict] = Field(default=None, sa_column=Column(JSON))
    created_at: datetime = Field(default_factory=datetime.utcnow)

    conversation: Optional["Conversation"] = Relationship(back_populates="messages")
