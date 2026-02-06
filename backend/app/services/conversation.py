"""
Conversation service.

Business logic for conversation and message management.
"""
from datetime import datetime
from typing import Optional, List

from sqlmodel import Session, select

from app.models.conversation import Conversation
from app.models.message import Message


class ConversationService:
    """Service for managing chat conversations and messages."""

    def __init__(self, session: Session):
        """Initialize with database session."""
        self.session = session

    def get_or_create_conversation(
        self, user_id: str, conversation_id: Optional[int] = None
    ) -> Conversation:
        """
        Get existing conversation or create a new one.

        Args:
            user_id: Owner's user ID
            conversation_id: Optional specific conversation ID to retrieve

        Returns:
            Conversation: Existing or newly created conversation
        """
        if conversation_id:
            # Try to get specific conversation
            statement = select(Conversation).where(
                Conversation.id == conversation_id,
                Conversation.user_id == user_id,
            )
            conversation = self.session.exec(statement).first()
            if conversation:
                return conversation

        # Get most recent conversation for user
        statement = (
            select(Conversation)
            .where(Conversation.user_id == user_id)
            .order_by(Conversation.updated_at.desc())
        )
        conversation = self.session.exec(statement).first()

        if conversation:
            return conversation

        # Create new conversation
        conversation = Conversation(user_id=user_id)
        self.session.add(conversation)
        self.session.commit()
        self.session.refresh(conversation)
        return conversation

    def load_messages(
        self, conversation_id: int, limit: int = 50
    ) -> List[Message]:
        """
        Load recent messages from a conversation.

        Args:
            conversation_id: The conversation to load messages from
            limit: Maximum number of messages to return (default 50)

        Returns:
            List[Message]: Messages ordered by created_at ascending
        """
        statement = (
            select(Message)
            .where(Message.conversation_id == conversation_id)
            .order_by(Message.created_at.desc())
            .limit(limit)
        )
        messages = list(self.session.exec(statement).all())
        # Reverse to get chronological order
        messages.reverse()
        return messages

    def save_message(
        self,
        conversation_id: int,
        user_id: str,
        role: str,
        content: str,
        tool_calls: Optional[dict] = None,
    ) -> Message:
        """
        Save a new message to the conversation.

        Args:
            conversation_id: Parent conversation ID
            user_id: Owner's user ID
            role: Message role (user | assistant | tool)
            content: Message text content
            tool_calls: Optional tool invocation metadata

        Returns:
            Message: The saved message
        """
        message = Message(
            conversation_id=conversation_id,
            user_id=user_id,
            role=role,
            content=content,
            tool_calls=tool_calls,
        )
        self.session.add(message)
        self.session.commit()
        self.session.refresh(message)
        return message

    def update_conversation_timestamp(self, conversation_id: int) -> None:
        """
        Update the conversation's updated_at timestamp.

        Args:
            conversation_id: The conversation to update
        """
        statement = select(Conversation).where(Conversation.id == conversation_id)
        conversation = self.session.exec(statement).first()
        if conversation:
            conversation.updated_at = datetime.utcnow()
            self.session.add(conversation)
            self.session.commit()
