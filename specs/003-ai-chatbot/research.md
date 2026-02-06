# Research: Todo AI Chatbot

**Feature**: 003-ai-chatbot
**Date**: 2026-02-03
**Status**: Complete

## 1. MCP Server Implementation (Python SDK)

### Decision: Use FastMCP from `mcp.server.fastmcp`

**Rationale**:
- Official MCP Python SDK provides `FastMCP` class with simple decorator-based tool definition
- Supports Streamable HTTP transport compatible with OpenAI Agents SDK
- High benchmark score (89.2) and comprehensive documentation

**Implementation Pattern**:
```python
from mcp.server.fastmcp import FastMCP

mcp = FastMCP("Todo Tools", json_response=True)

@mcp.tool()
def add_task(user_id: str, title: str, description: str = None) -> dict:
    """Add a new task for the user"""
    # Tool implementation
    return {"id": 123, "title": title, "status": "created"}
```

**Alternatives Considered**:
- Raw MCP server class: More control but significantly more boilerplate
- Microsoft MCP implementation: Different ecosystem focus, not Python-native

**Key Finding**: MCP tools must be stateless - they receive all context via parameters and return JSON responses.

---

## 2. Agent SDK with Model-Agnostic LLM (Gemini via LiteLLM)

### Decision: Use OpenAI Agents SDK with LitellmModel wrapper

**Rationale**:
- OpenAI Agents SDK provides native MCP server integration via `MCPServerStreamableHttp`
- LiteLLM extension allows using Gemini without changing agent code
- Model-agnostic design: swap providers by changing model string only

**Implementation Pattern**:
```python
from agents import Agent, Runner
from agents.extensions.models.litellm_model import LitellmModel
from agents.mcp import MCPServerStreamableHttp

# Gemini model via LiteLLM
model = LitellmModel(
    model="gemini/gemini-2.5-flash-preview-04-17",
    api_key=os.getenv("GEMINI_API_KEY")
)

async with MCPServerStreamableHttp(
    name="todo-tools",
    params={"url": "http://localhost:8001/mcp"}
) as mcp_server:
    agent = Agent(
        name="Todo Assistant",
        instructions="...",
        model=model,
        mcp_servers=[mcp_server]
    )
```

**Alternatives Considered**:
- Direct Gemini SDK: Would require custom tool binding, loses MCP compatibility
- LangChain: Heavier dependency, overkill for this use case
- Native OpenAI: Explicitly excluded per requirements

**Key Finding**: Agent never accesses DB directly - all operations go through MCP tools.

---

## 3. ChatKit Integration (Frontend-Backend)

### Decision: ChatKit Web Component with FastAPI `/chatkit` endpoint

**Rationale**:
- ChatKit provides production-ready React components for chat UI
- Backend processes requests via `server.process()` pattern
- Supports streaming responses via Server-Sent Events

**Implementation Pattern**:
```python
# Backend endpoint
@app.post("/api/{user_id}/chat")
async def chat_endpoint(user_id: str, request: Request):
    payload = await request.body()
    result = await chatkit_server.process(payload, {"user_id": user_id})
    if isinstance(result, StreamingResult):
        return StreamingResponse(result, media_type="text/event-stream")
    return JSONResponse(result)
```

**Frontend Pattern**:
```tsx
// ChatKit Web Component - UI only, no direct LLM calls
<ChatKit
  endpoint="/api/{user_id}/chat"
  // No api_key - backend handles LLM
/>
```

**Alternatives Considered**:
- Custom chat UI: More work, reinventing the wheel
- Direct OpenAI ChatKit with API key: Violates requirement for backend-only LLM calls

**Key Finding**: ChatKit can operate in "server mode" where all LLM interaction is proxied through backend.

---

## 4. Conversation Persistence Strategy

### Decision: PostgreSQL with Conversation and Message tables

**Rationale**:
- Stateless architecture requires DB-based context loading
- Neon PostgreSQL already in use for Task table
- SQLModel ORM consistent with existing codebase

**Schema Design**:
```
Conversation
├── id (PK)
├── user_id (FK to user, indexed)
├── created_at
└── updated_at

Message
├── id (PK)
├── conversation_id (FK to Conversation)
├── user_id (for query optimization)
├── role (enum: user | assistant | tool)
├── content (text)
└── created_at
```

**Context Loading Strategy**:
1. On each request, load last 50 messages from conversation
2. Format as chat history for agent
3. New messages saved after agent response

**Alternatives Considered**:
- Redis for conversation cache: Adds infrastructure, not justified for MVP
- In-memory per-session: Violates stateless requirement

**Key Finding**: Context limit of 50 messages balances context quality with token budget.

---

## 5. MCP Tool Definitions

### Decision: Five stateless tools with user_id scoping

**Tools Defined**:

| Tool | Parameters | Returns |
|------|------------|---------|
| `add_task` | user_id, title, description? | Created task object |
| `list_tasks` | user_id, include_completed? | Array of task objects |
| `complete_task` | user_id, task_identifier | Updated task object |
| `delete_task` | user_id, task_identifier | Deletion confirmation |
| `update_task` | user_id, task_identifier, title?, description? | Updated task object |

**Key Design Decisions**:
- `task_identifier` accepts title substring for natural language matching
- Tools query DB to find matching tasks (no hallucinated IDs)
- All tools return structured JSON with success/error status

**Alternatives Considered**:
- Numeric ID only: Poor UX for natural language ("delete task 47")
- Direct task reference: Agent can't know IDs without listing first

---

## 6. Error Handling Patterns

### Decision: Structured error responses with user-friendly messages

**Error Response Format**:
```json
{
  "success": false,
  "error": {
    "code": "TASK_NOT_FOUND",
    "message": "I couldn't find a task matching 'groceries'",
    "suggestions": ["buy milk", "shopping list", "weekly groceries"]
  }
}
```

**Error Categories**:
- `TASK_NOT_FOUND`: No matching task, suggest similar
- `AMBIGUOUS_MATCH`: Multiple matches, list options
- `EMPTY_LIST`: No tasks, prompt to create
- `DB_ERROR`: Temporary issue, retry message
- `RATE_LIMITED`: Too many requests, wait message

**Key Finding**: Agent translates error codes to friendly language in response.

---

## 7. Testing Strategy

### Decision: Multi-layer testing with manual replay scripts

**Test Layers**:
1. **Unit Tests**: MCP tool functions with mocked DB
2. **Integration Tests**: Full request cycle with test DB
3. **E2E Tests**: Playwright for frontend chat flow
4. **Manual Replay**: curl scripts for common scenarios

**Replay Script Example**:
```bash
# test-add-task.sh
curl -X POST http://localhost:8000/api/test-user/chat \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"message": "Add a task to buy groceries"}'
```

---

## Dependencies to Add

### Backend (requirements.txt additions):
```
mcp>=1.0.0  # MCP Python SDK
openai-agents>=0.7.0  # Agents SDK
openai-agents[litellm]  # LiteLLM extension
chatkit-server>=0.1.0  # ChatKit Python backend
google-generativeai>=0.4.0  # Gemini API (backup)
litellm>=1.0.0  # LLM abstraction
```

### Frontend (package.json additions):
```json
{
  "@openai/chatkit": "^0.1.0"
}
```

---

## Environment Variables

```env
# Existing
BETTER_AUTH_URL=http://localhost:3000
DATABASE_URL=postgresql://...

# New for AI Chatbot
GEMINI_API_KEY=your-gemini-api-key
MCP_SERVER_URL=http://localhost:8001/mcp
CHAT_CONTEXT_LIMIT=50
RATE_LIMIT_PER_MINUTE=60
```
