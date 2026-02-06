"""
Chat endpoints router.

API routes for AI chatbot interactions with JWT authentication.
"""
import logging
import os
import time
from collections import defaultdict
from typing import Dict, Tuple

from fastapi import APIRouter, Depends, HTTPException, status

# Configure logging
logger = logging.getLogger(__name__)

from app.auth import get_current_user
from app.dependencies import SessionDep
from app.schemas.chat import ChatRequest, ChatResponse
from app.services.conversation import ConversationService
from app.services.agent import run_agent

router = APIRouter()

# Simple in-memory rate limiter
# In production, use Redis or similar for distributed rate limiting
RATE_LIMIT_PER_MINUTE = int(os.getenv("RATE_LIMIT_PER_MINUTE", "60"))
_rate_limit_store: Dict[str, Tuple[int, float]] = defaultdict(lambda: (0, 0.0))


def check_rate_limit(user_id: str) -> bool:
    """
    Check if user has exceeded rate limit.

    Returns True if request is allowed, raises HTTPException if rate limited.
    """
    current_time = time.time()
    count, window_start = _rate_limit_store[user_id]

    # Reset window if more than 60 seconds have passed
    if current_time - window_start > 60:
        _rate_limit_store[user_id] = (1, current_time)
        return True

    # Check if limit exceeded
    if count >= RATE_LIMIT_PER_MINUTE:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Too many requests. Please wait a moment before trying again.",
        )

    # Increment counter
    _rate_limit_store[user_id] = (count + 1, window_start)
    return True


@router.post("/{user_id}/chat", response_model=ChatResponse)
async def send_chat_message(
    user_id: str,
    request: ChatRequest,
    session: SessionDep,
    authenticated_user: str = Depends(get_current_user),
) -> ChatResponse:
    """
    Send a chat message to the AI agent.

    Accepts a natural language message, processes it through the AI agent,
    and returns the agent's response. The agent uses MCP tools to perform
    task operations as needed.

    Args:
        user_id: The ID of the user (must match authenticated user)
        request: Chat message request body
        session: Database session (injected by FastAPI)
        authenticated_user: User ID extracted from JWT token

    Returns:
        ChatResponse: Agent's response with conversation_id, message, and tool_results

    Raises:
        401 Unauthorized: If JWT token is missing, invalid, or expired
        403 Forbidden: If authenticated_user doesn't match requested user_id
    """
    # Ownership validation: ensure authenticated user matches requested user_id (T040)
    if authenticated_user != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Cannot access another user's chat",
        )

    # Rate limiting check (T041)
    check_rate_limit(authenticated_user)

    try:
        # Initialize conversation service
        conv_service = ConversationService(session)

        # Get or create conversation
        conversation = conv_service.get_or_create_conversation(
            user_id=authenticated_user,
            conversation_id=request.conversation_id,
        )

        # Load conversation history for context
        messages = conv_service.load_messages(conversation.id)
        conversation_history = [
            {"role": msg.role, "content": msg.content}
            for msg in messages
        ]

        # Save user message before agent call
        conv_service.save_message(
            conversation_id=conversation.id,
            user_id=authenticated_user,
            role="user",
            content=request.message,
        )

        # Run agent with message and context
        agent_response = await run_agent(
            user_id=authenticated_user,
            message=request.message,
            conversation_history=conversation_history,
        )

        # Save assistant message after agent call
        conv_service.save_message(
            conversation_id=conversation.id,
            user_id=authenticated_user,
            role="assistant",
            content=agent_response["message"],
            tool_calls={"results": agent_response.get("tool_results")}
            if agent_response.get("tool_results")
            else None,
        )

        # Update conversation timestamp
        conv_service.update_conversation_timestamp(conversation.id)

        return ChatResponse(
            conversation_id=conversation.id,
            message=agent_response["message"],
            tool_results=agent_response.get("tool_results"),
        )

    except HTTPException:
        # Re-raise HTTP exceptions as-is
        raise
    except Exception as e:
        # Log the actual exception for debugging
        logger.error(
            f"Chat endpoint error for user {user_id}: {type(e).__name__}: {e}",
            exc_info=True,
        )
        # Graceful error handling for DB and other errors (T038)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Sorry, something went wrong processing your message. Please try again.",
        ) from e
