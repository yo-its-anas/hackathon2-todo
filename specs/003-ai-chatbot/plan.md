# Implementation Plan: Todo AI Chatbot

**Branch**: `003-ai-chatbot` | **Date**: 2026-02-03 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/003-ai-chatbot/spec.md`

## Summary

Add a natural-language AI chatbot to the existing Todo app that allows users to manage tasks through conversational interactions. The chatbot uses MCP (Model Context Protocol) tools exclusively for task operations, with Gemini as the LLM provider via the OpenAI Agents SDK. The architecture is stateless with conversation history persisted to PostgreSQL.

## Technical Context

**Language/Version**: Python 3.11+
**Primary Dependencies**: FastAPI, OpenAI Agents SDK, MCP Python SDK, LiteLLM, ChatKit
**Storage**: Neon PostgreSQL (existing) + new Conversation/Message tables
**Testing**: pytest, httpx for integration tests
**Target Platform**: Linux server (Docker-compatible)
**Project Type**: Web application (frontend + backend)
**Performance Goals**: <3s response for task operations, 100 concurrent users
**Constraints**: Agent uses MCP tools only (no direct DB), ChatKit UI-only (no client LLM calls)
**Scale/Scope**: Single tenant, ~50 messages context window

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Spec-Driven Lifecycle | PASS | Following spec → plan → tasks → implement |
| II. No Code Without Authorization | PASS | All code mapped to tasks.md |
| III. AI-Only Implementation | PASS | All code via /sp.implement |
| IV. Clarification Over Assumptions | PASS | No unresolved NEEDS CLARIFICATION |
| V. Clean Code Standards | PASS | Will enforce via implementation |
| VI. Technology Stack Adherence | PASS | FastAPI, SQLModel, Neon per spec |
| VII. State Management Discipline | PASS | Stateless + DB persistence documented |
| VIII. Traceability | PASS | Task→Plan→Spec references maintained |
| IX. Mandatory Documentation | PASS | README, quickstart.md included |
| X. External Knowledge via Context7 | PASS | MCP SDK, Agents SDK, ChatKit researched |

## Project Structure

### Documentation (this feature)

```text
specs/003-ai-chatbot/
├── spec.md              # Feature specification
├── plan.md              # This file
├── research.md          # Phase 0: Technology research
├── data-model.md        # Phase 1: Entity definitions
├── quickstart.md        # Phase 1: Setup guide
├── contracts/           # Phase 1: API contracts
│   ├── chat-api.yaml    # OpenAPI spec for chat endpoint
│   └── mcp-tools.yaml   # MCP tool definitions
├── checklists/
│   └── requirements.md  # Spec quality checklist
└── tasks.md             # Phase 2: Implementation tasks (via /sp.tasks)
```

### Source Code (repository root)

```text
backend/
├── app/
│   ├── models/
│   │   ├── task.py           # Existing
│   │   ├── conversation.py   # NEW: Chat conversation model
│   │   └── message.py        # NEW: Chat message model
│   ├── schemas/
│   │   ├── task.py           # Existing
│   │   └── chat.py           # NEW: Chat request/response schemas
│   ├── routers/
│   │   ├── tasks.py          # Existing
│   │   └── chat.py           # NEW: Chat API router
│   ├── services/
│   │   ├── agent.py          # NEW: AI agent configuration
│   │   └── conversation.py   # NEW: Conversation persistence
│   ├── mcp/
│   │   ├── __init__.py       # NEW: MCP package init
│   │   ├── server.py         # NEW: FastMCP server setup
│   │   └── tools.py          # NEW: MCP tool implementations
│   ├── auth.py               # Existing
│   ├── database.py           # Existing
│   └── main.py               # Modified: Add chat router
├── tests/
│   ├── test_mcp_tools.py     # NEW: MCP tool unit tests
│   ├── test_chat_endpoint.py # NEW: Chat API integration tests
│   └── test_conversation.py  # NEW: Conversation service tests
└── requirements.txt          # Modified: Add new dependencies

frontend/
├── app/
│   └── chat/
│       └── page.tsx          # NEW: Chat page route
├── components/
│   └── chat/
│       ├── ChatInterface.tsx # NEW: ChatKit wrapper component
│       └── MessageList.tsx   # NEW: Message display component
├── services/
│   └── chat.ts               # NEW: Chat API client
└── package.json              # Modified: Add @openai/chatkit
```

**Structure Decision**: Web application structure extending existing backend/ and frontend/ directories. New files added within established patterns.

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                           Frontend (Next.js)                        │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │                     ChatKit Web Component                      │  │
│  │  - UI rendering only                                          │  │
│  │  - No direct LLM API calls                                    │  │
│  │  - Sends messages to /api/{user_id}/chat                      │  │
│  └───────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    │ POST /api/{user_id}/chat
                                    │ Authorization: Bearer <JWT>
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│                         Backend (FastAPI)                           │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────────┐  │
│  │ JWT Auth        │  │ Chat Router     │  │ Conversation        │  │
│  │ Middleware      │─▶│ /api/chat       │─▶│ Service             │  │
│  │ (Better Auth)   │  │                 │  │ (Load/Save)         │  │
│  └─────────────────┘  └────────┬────────┘  └──────────┬──────────┘  │
│                                │                       │            │
│                                ▼                       ▼            │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │                      AI Agent Runner                         │   │
│  │  - OpenAI Agents SDK                                        │   │
│  │  - LiteLLM Model (Gemini)                                   │   │
│  │  - MCP Server Connection                                     │   │
│  └────────────────────────────┬────────────────────────────────┘   │
└───────────────────────────────┼─────────────────────────────────────┘
                                │
                                │ MCP Protocol (HTTP)
                                ▼
┌─────────────────────────────────────────────────────────────────────┐
│                       MCP Server (FastMCP)                          │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐   │
│  │ add_task    │ │ list_tasks  │ │ complete    │ │ delete/     │   │
│  │             │ │             │ │ _task       │ │ update_task │   │
│  └──────┬──────┘ └──────┬──────┘ └──────┬──────┘ └──────┬──────┘   │
└─────────┼───────────────┼───────────────┼───────────────┼───────────┘
          │               │               │               │
          └───────────────┴───────────────┴───────────────┘
                                │
                                │ SQLModel ORM
                                ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    PostgreSQL (Neon Serverless)                     │
│  ┌─────────────┐  ┌─────────────────┐  ┌─────────────────────────┐  │
│  │ tasks       │  │ conversations   │  │ messages                │  │
│  │ (existing)  │  │ (new)           │  │ (new)                   │  │
│  └─────────────┘  └─────────────────┘  └─────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
```

## Chat Endpoint Request Lifecycle

```
1. User sends message via ChatKit UI
   ↓
2. Frontend POSTs to /api/{user_id}/chat with JWT
   ↓
3. FastAPI validates JWT (Better Auth JWKS)
   ├── Invalid token → 401 Unauthorized
   └── Valid → continue
   ↓
4. Verify user_id matches JWT subject
   ├── Mismatch → 403 Forbidden
   └── Match → continue
   ↓
5. Load conversation context from DB
   ├── conversation_id provided → load that conversation
   └── No conversation_id → create new conversation
   ↓
6. Save user message to messages table
   ↓
7. Build agent context (last 50 messages)
   ↓
8. Run AI Agent with MCP tools
   ├── Agent analyzes user intent
   ├── Agent calls MCP tool(s) as needed
   │   └── MCP tool executes DB operation
   └── Agent generates response
   ↓
9. Save assistant message (with tool_calls) to DB
   ↓
10. Return streaming or JSON response to frontend
```

## MCP Server Setup

### Server Configuration
- **Transport**: Streamable HTTP on port 8001
- **Endpoint**: `http://localhost:8001/mcp`
- **Tools**: 5 stateless functions (add, list, complete, delete, update)

### Tool Design Principles
1. **Stateless**: Each tool receives all context via parameters
2. **User-scoped**: All operations filtered by user_id
3. **Natural language matching**: task_identifier uses title substring search
4. **Structured errors**: Return error codes + user-friendly messages

### Tool Implementations (see contracts/mcp-tools.yaml)

| Tool | Trigger Intent | DB Operation |
|------|---------------|--------------|
| add_task | "add", "create", "remind me" | INSERT INTO tasks |
| list_tasks | "show", "list", "what do I have" | SELECT FROM tasks |
| complete_task | "done", "finished", "complete" | UPDATE tasks SET is_completed=true |
| delete_task | "delete", "remove", "cancel" | DELETE FROM tasks |
| update_task | "change", "edit", "rename" | UPDATE tasks |

## Agent Setup (Model-Agnostic)

### LiteLLM Configuration
```python
from agents.extensions.models.litellm_model import LitellmModel

model = LitellmModel(
    model="gemini/gemini-2.0-flash",  # or gemini-1.5-pro
    api_key=os.getenv("GEMINI_API_KEY")
)
```

### Agent Definition
```python
from agents import Agent

agent = Agent(
    name="Todo Assistant",
    instructions=SYSTEM_PROMPT,  # See contracts/mcp-tools.yaml
    model=model,
    mcp_servers=[mcp_server_connection]
)
```

### Model Provider Abstraction
- Model string format: `provider/model-name`
- Supported: `gemini/gemini-2.0-flash`, `anthropic/claude-3-sonnet`, `openai/gpt-4o`
- Swap provider by changing env var `LLM_MODEL`

## Conversation Persistence Strategy

### On Each Request:
1. **Load**: Query last 50 messages for conversation
2. **Format**: Convert to agent chat history format
3. **Execute**: Run agent with history
4. **Save**: Persist new user and assistant messages

### Context Window Management:
- Max 50 messages loaded per request
- Older messages remain in DB (for history UI)
- Conversation auto-created if none exists for user

### Message Roles:
- `user`: Human messages
- `assistant`: AI responses
- `tool`: Tool execution results (stored in tool_calls JSON)

## Error Handling Strategy

### Error Categories

| Code | HTTP | Message Template |
|------|------|-----------------|
| TASK_NOT_FOUND | 200 | "I couldn't find a task matching '{query}'" |
| AMBIGUOUS_MATCH | 200 | "I found multiple tasks: {list}. Which one?" |
| EMPTY_LIST | 200 | "You don't have any tasks yet. Want to add one?" |
| UNAUTHORIZED | 401 | "Please sign in to continue" |
| FORBIDDEN | 403 | "You can only access your own tasks" |
| RATE_LIMITED | 429 | "Slow down! Try again in a moment." |
| DB_ERROR | 500 | "Having trouble right now. Please try again." |
| AGENT_ERROR | 500 | "Something went wrong. Please try again." |

### Error Response Format
```json
{
  "error": {
    "code": "TASK_NOT_FOUND",
    "message": "I couldn't find a task matching 'groceries'",
    "suggestions": ["buy milk", "shopping"]
  }
}
```

### Agent Error Translation
- MCP tools return structured errors
- Agent transforms to friendly language
- Suggestions provided when helpful

## Frontend ChatKit Integration

### ChatKit Component Setup
```tsx
// No API key in frontend - backend handles LLM
<ChatKit
  endpoint={`/api/${userId}/chat`}
  getHeaders={() => ({
    Authorization: `Bearer ${token}`
  })}
  placeholder="Type a message to manage your tasks..."
/>
```

### Key Integration Points:
1. **Authentication**: Pass JWT in headers
2. **User ID**: Include in endpoint URL
3. **Streaming**: Handle SSE events for real-time response
4. **Error Display**: Show friendly messages from error responses

## Environment Variables

### Backend (.env)
```env
# Existing
DATABASE_URL=postgresql://user:pass@host/db
BETTER_AUTH_URL=http://localhost:3000

# New for AI Chatbot
GEMINI_API_KEY=your-gemini-api-key
MCP_SERVER_PORT=8001
CHAT_CONTEXT_LIMIT=50
RATE_LIMIT_PER_MINUTE=60
LLM_MODEL=gemini/gemini-2.0-flash
```

### Frontend (.env.local)
```env
# Existing
NEXT_PUBLIC_API_URL=http://localhost:8000

# No new secrets needed - chat uses existing auth
```

## Local Dev vs Production

| Aspect | Local | Production |
|--------|-------|------------|
| MCP Server | Same process or localhost:8001 | Internal service mesh |
| Database | Local/Docker Postgres | Neon Serverless |
| LLM | Gemini API (dev key) | Gemini API (prod key) |
| Auth | Better Auth localhost | Better Auth deployed |
| Rate Limit | Disabled or lenient | 60 req/min per user |
| Logging | Debug level | Info level |

## Testing Strategy

### Unit Tests (pytest)
- MCP tool functions with mocked DB session
- Conversation service functions
- Error code generation

### Integration Tests (httpx)
- Full chat endpoint flow with test JWT
- Conversation persistence
- Rate limiting

### E2E Tests (Playwright)
- Chat UI interaction
- Multi-turn conversation
- Error state display

### Manual Replay Scripts
```bash
# scripts/test-chat.sh
curl -X POST localhost:8000/api/test-user/chat \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"message": "Add buy milk"}'

curl -X POST localhost:8000/api/test-user/chat \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"message": "Show my tasks"}'
```

## Implementation Phases

### Phase 1: Database & Models
1. Create Conversation model
2. Create Message model
3. Run migrations
4. Add conversation service

### Phase 2: MCP Server
1. Set up FastMCP server
2. Implement add_task tool
3. Implement list_tasks tool
4. Implement complete_task tool
5. Implement delete_task tool
6. Implement update_task tool
7. Add tool tests

### Phase 3: Agent Integration
1. Configure LiteLLM with Gemini
2. Create agent with system prompt
3. Wire MCP server connection
4. Add agent runner service

### Phase 4: Chat Endpoint
1. Create chat router
2. Implement request lifecycle
3. Add conversation context loading
4. Add message persistence
5. Add error handling
6. Add rate limiting

### Phase 5: Frontend
1. Add ChatKit dependency
2. Create chat page route
3. Create ChatInterface component
4. Wire authentication headers
5. Add streaming response handling

### Phase 6: Testing & Polish
1. Write unit tests
2. Write integration tests
3. Create manual test scripts
4. Update README

## Complexity Tracking

No complexity justifications needed - all design decisions follow simplest viable approach:
- Standard MCP tool pattern (no custom protocol)
- Single conversation per user (no multi-session complexity)
- PostgreSQL for all persistence (no Redis/cache layer)
- Synchronous tool execution (no background jobs)

---

**Next Step**: Run `/sp.tasks` to generate implementation tasks from this plan.
