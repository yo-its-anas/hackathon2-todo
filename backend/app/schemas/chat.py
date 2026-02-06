"""
Chat API schemas.

Pydantic models for chat request/response validation per contracts/chat-api.yaml.
"""
from datetime import datetime
from typing import Optional, List

from pydantic import BaseModel, Field


class ChatRequest(BaseModel):
    """Request body for POST /api/{user_id}/chat endpoint."""

    message: str = Field(
        ...,
        min_length=1,
        max_length=2000,
        description="Natural language message from user",
    )
    conversation_id: Optional[int] = Field(
        default=None,
        description="Existing conversation ID (null to start new)",
    )


class ToolResult(BaseModel):
    """Result from an MCP tool call."""

    tool: str = Field(..., description="Name of the MCP tool called")
    success: bool = Field(..., description="Whether the tool call succeeded")
    result: Optional[dict] = Field(
        default=None, description="Tool-specific result data"
    )


class ChatResponse(BaseModel):
    """Response body for POST /api/{user_id}/chat endpoint."""

    conversation_id: int = Field(
        ..., description="The conversation ID (may be newly created)"
    )
    message: str = Field(..., description="AI agent's response text")
    tool_results: Optional[List[ToolResult]] = Field(
        default=None, description="Results from any MCP tool calls"
    )


class MessageResponse(BaseModel):
    """Single message in conversation history."""

    id: int
    conversation_id: int
    role: str
    content: str
    tool_calls: Optional[dict] = None
    created_at: datetime


class ConversationResponse(BaseModel):
    """Conversation summary for listing."""

    id: int
    user_id: str
    created_at: datetime
    updated_at: datetime
    message_count: Optional[int] = None
