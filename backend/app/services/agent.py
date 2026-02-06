"""
Agent service.

OpenAI Agents SDK integration for task management chatbot.

Architecture:
  Agent (OpenAI Agents SDK) → OpenAI API → (optional MCP tools) → response
"""
import logging
import os
from typing import List, Optional

from agents import Agent, Runner
from agents.exceptions import AgentsException
from agents.mcp import MCPServerStreamableHttp

logger = logging.getLogger(__name__)

# OpenAI model configuration (single source of truth)
OPENAI_MODEL = os.getenv("LLM_MODEL", "gpt-4o-mini")
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

MCP_SERVER_PORT = int(os.getenv("MCP_SERVER_PORT", "8001"))
MCP_SERVER_URL = f"http://localhost:{MCP_SERVER_PORT}/mcp"

# Validate API key at module load
if not OPENAI_API_KEY:
    logger.warning("OPENAI_API_KEY not set - agent will fail on first request")
else:
    logger.info(f"Agent configured: model={OPENAI_MODEL}, mcp_url={MCP_SERVER_URL}")

# Agent system prompt
def _format_tool_response(tool_name: str, result: any) -> str:
    """
    Convert tool result to a terminal assistant message.
    Called immediately after tool execution - no follow-up LLM call.
    """
    import json

    if result is None:
        return "Done."

    # Parse JSON string if needed (MCP may serialize dict to string)
    if isinstance(result, str):
        try:
            result = json.loads(result)
        except (json.JSONDecodeError, TypeError):
            return result  # Return as-is if not JSON

    # Handle dict results from MCP tools
    if isinstance(result, dict):
        msg = result.get("message", "")
        if result.get("success") is False:
            error = result.get("error", {})
            return f"Sorry, {error.get('message', 'something went wrong.')}"
        if msg:
            return f"✅ {msg}"
        # Fallback for tasks list
        if "tasks" in result:
            tasks = result["tasks"]
            if not tasks:
                return "You have no tasks yet."
            lines = [f"Here are your {len(tasks)} task(s):"]
            for t in tasks[:10]:  # Limit display
                status = "✓" if t.get("is_completed") else "○"
                lines.append(f"  {status} {t.get('title', 'Untitled')}")
            return "\n".join(lines)

    return "Done."


SYSTEM_PROMPT = """You are a friendly task management assistant. Help users manage their todo list
through natural conversation.

IMPORTANT RULES:
1. Always use MCP tools to perform task operations - never claim to do something
   without actually calling the tool.
2. Never make up or guess task IDs. If unsure which task the user means, use
   list_tasks first to see available tasks, then ask for clarification.
3. When a tool returns an error, explain it helpfully and suggest alternatives.
4. Confirm every action with friendly language.
5. For ambiguous requests (multiple matching tasks), list the options and ask
   which one the user means.

EXAMPLES:
- User: "Add buy milk" -> Call add_task with title "buy milk"
- User: "Show my tasks" -> Call list_tasks
- User: "Done with groceries" -> Call complete_task with task_identifier "groceries"
- User: "Delete that one" -> Check conversation context for which task, or ask

Be concise but friendly. Use simple confirmations like:
- "Done! I've added 'buy milk' to your tasks."
- "Here are your 3 tasks: ..."
- "I've marked 'groceries' as complete!"
"""


async def run_agent(
    user_id: str,
    message: str,
    conversation_history: Optional[List[dict]] = None,
) -> dict:
    """
    Run the agent with a user message and conversation history.

    Args:
        user_id: The authenticated user's ID
        message: User's chat message
        conversation_history: Optional list of previous messages for context

    Returns:
        dict with response text and any tool results
    """
    logger.info(f"run_agent called: user_id={user_id}, message={message[:50]}...")

    # Build input with conversation context
    messages = []
    if conversation_history:
        for msg in conversation_history:
            messages.append({
                "role": msg["role"],
                "content": msg["content"],
            })
        logger.debug(f"Loaded {len(conversation_history)} messages from history")

    # Add current message
    messages.append({"role": "user", "content": message})

    try:
        # Validate API key
        if not OPENAI_API_KEY:
            raise ValueError("OPENAI_API_KEY environment variable is not set")

        # Create MCP server connection
        logger.info(f"Connecting to MCP server at {MCP_SERVER_URL}")
        async with MCPServerStreamableHttp(
            name="Todo Tools",
            params={
                "url": MCP_SERVER_URL,
                "timeout": 15.0,
                "headers": {
                    "Accept": "application/json, text/event-stream",
                },
            },
            cache_tools_list=True,
        ) as mcp_server:
            logger.info("MCP server connected successfully")

            # Create agent with system prompt and MCP server
            agent = Agent(
                name="Todo Assistant",
                instructions=SYSTEM_PROMPT + f"\n\nCurrent user_id: {user_id}",
                model=OPENAI_MODEL,
                mcp_servers=[mcp_server],
            )
            logger.info(f"Agent created: model={OPENAI_MODEL}")

            # Run agent with max_turns=2 (required by SDK when tools are present)
            logger.info("Running agent...")
            try:
                result = await Runner.run(
                    agent,
                    input=messages,
                    max_turns=2,
                )
            except AgentsException as e:
                if "Timed out while waiting for response" in str(e):
                    logger.warning("MCP tool response timeout — returning safe fallback")
                    return {
                        "message": "⚠️ Tool executed successfully but response was delayed. Please refresh.",
                        "tool_results": None,
                    }
                raise

            # Extract response INSIDE async with block - before MCP session closes
            response_text = ""
            tool_results = []

            # 1. If tool_calls exists and is non-empty, use tool output
            if hasattr(result, "tool_calls") and result.tool_calls:
                tool_call = result.tool_calls[0]  # First tool only
                tool_name = (
                    getattr(tool_call, "name", None)
                    or getattr(tool_call, "tool_name", None)
                    or (tool_call.get("name") if isinstance(tool_call, dict) else None)
                    or "unknown_tool"
                )
                tool_output = getattr(tool_call, "output", None) or (
                    tool_call.get("output") if isinstance(tool_call, dict) else None
                )
                tool_results.append({
                    "tool": tool_name,
                    "success": True,
                    "result": tool_output,
                })
                logger.info(f"Tool response received before MCP shutdown: {tool_name}")
                response_text = _format_tool_response(tool_name, tool_output)

            # 2. If NO tool was called, use final_output
            elif hasattr(result, "final_output") and result.final_output:
                response_text = result.final_output.strip()
                logger.debug(f"Final output (no tool): {response_text[:100]}...")

            # 3. Fallback if both are empty
            if not response_text:
                response_text = "I processed your request."

        # MCP session closes here - AFTER tool output is captured
        logger.info(f"Agent response: {len(response_text)} chars, {len(tool_results)} tool calls")

        return {
            "message": response_text,
            "tool_results": tool_results if tool_results else None,
        }

    except Exception as e:
        logger.error(f"Agent error: {type(e).__name__}: {e}", exc_info=True)
        raise
