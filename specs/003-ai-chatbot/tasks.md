# Tasks: Todo AI Chatbot

**Input**: Design documents from `/specs/003-ai-chatbot/`
**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, contracts/

**Tests**: No explicit test requests in specification. Test tasks omitted per template rules.

**Organization**: Tasks grouped by user story to enable independent implementation and testing.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1-US7)
- Exact file paths from plan.md structure

## Path Conventions

- **Backend**: `backend/app/` (FastAPI)
- **Frontend**: `frontend/` (Next.js)
- **MCP Server**: `backend/app/mcp/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Install dependencies and configure project for AI chatbot feature

- [x] T001 Add backend dependencies to backend/requirements.txt: mcp, openai-agents, openai-agents[litellm], litellm
- [x] T002 [P] Add frontend dependency @openai/chatkit to frontend/package.json and run npm install
- [x] T003 [P] Add new environment variables to backend/.env.example: GEMINI_API_KEY, MCP_SERVER_PORT, CHAT_CONTEXT_LIMIT, RATE_LIMIT_PER_MINUTE, LLM_MODEL
- [x] T004 [P] Create MCP package directory structure: backend/app/mcp/__init__.py
- [x] T005 [P] Create services directory structure: backend/app/services/__init__.py (if not exists)
- [x] T006 [P] Create frontend chat directory structure: frontend/app/chat/ and frontend/components/chat/

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Database models and core services that ALL user stories depend on

**CRITICAL**: No user story work can begin until this phase is complete

### Database Models

- [x] T007 Create Conversation model in backend/app/models/conversation.py per data-model.md specification
- [x] T008 Create Message model in backend/app/models/message.py per data-model.md specification
- [x] T009 Update backend/app/models/__init__.py to export Conversation and Message models
- [x] T010 Run database migration to create conversations and messages tables (SQLModel metadata.create_all)

### Chat Schemas

- [x] T011 Create ChatRequest and ChatResponse Pydantic schemas in backend/app/schemas/chat.py per contracts/chat-api.yaml

### Conversation Service

- [x] T012 Implement ConversationService in backend/app/services/conversation.py with methods: get_or_create_conversation, load_messages, save_message, update_conversation_timestamp

### MCP Server Core

- [x] T013 Implement FastMCP server setup in backend/app/mcp/server.py with streamable-http transport on port 8001
- [x] T014 Create MCP tool helper for task matching (substring search) in backend/app/mcp/tools.py

### Agent Service Core

- [x] T015 Implement LiteLLM model configuration (Gemini) in backend/app/services/agent.py
- [x] T016 Create Agent definition with system prompt from contracts/mcp-tools.yaml in backend/app/services/agent.py
- [x] T017 Implement agent runner function that connects to MCP server in backend/app/services/agent.py

**Checkpoint**: Foundation ready - user story implementation can now begin

---

## Phase 3: User Story 1 - Add Task via Chat (Priority: P1) MVP

**Goal**: Users can add new tasks by typing natural language messages like "Add a task to buy groceries"

**Independent Test**: Send chat message requesting task creation, verify task appears in database with correct title

**Implements**: FR-001, FR-005, FR-006 (add_task), FR-007, FR-009

### MCP Tool: add_task

- [x] T018 [US1] Implement add_task MCP tool in backend/app/mcp/tools.py that creates task via SQLModel and returns confirmation

### Chat Endpoint (Minimal)

- [x] T019 [US1] Create chat router in backend/app/routers/chat.py with POST /api/{user_id}/chat endpoint
- [x] T020 [US1] Implement JWT authentication and user_id verification in chat endpoint (reuse existing auth.py)
- [x] T021 [US1] Wire chat endpoint to agent runner: load context, run agent, save messages
- [x] T022 [US1] Register chat router in backend/app/main.py

### Frontend (Minimal)

- [x] T023 [US1] Create chat page route in frontend/app/chat/page.tsx with ChatKit component
- [x] T024 [US1] Create ChatInterface component in frontend/components/chat/ChatInterface.tsx wrapping ChatKit with auth headers
- [x] T025 [US1] Create chat API client service in frontend/services/chat.ts

**Checkpoint**: User Story 1 complete - Can add tasks via chat conversation

---

## Phase 4: User Story 2 - List Tasks via Chat (Priority: P1) MVP

**Goal**: Users can see their tasks by asking "Show my tasks" or "What's on my list?"

**Independent Test**: Request task list via chat, verify all user tasks displayed with status indicators

**Implements**: FR-006 (list_tasks), FR-007, FR-008 (empty list), FR-009

### MCP Tool: list_tasks

- [x] T026 [US2] Implement list_tasks MCP tool in backend/app/mcp/tools.py that queries user tasks and formats response

**Checkpoint**: User Story 2 complete - Can list tasks via chat (depends on US1 for task creation)

---

## Phase 5: User Story 3 - Complete Task via Chat (Priority: P2)

**Goal**: Users can mark tasks complete by saying "Complete the grocery task" or "I finished buying groceries"

**Independent Test**: Complete existing task via chat, verify is_completed=true in database

**Implements**: FR-006 (complete_task), FR-007, FR-008 (not found), FR-009, FR-011

### MCP Tool: complete_task

- [x] T027 [US3] Implement complete_task MCP tool in backend/app/mcp/tools.py with task matching by title substring
- [x] T028 [US3] Add TASK_NOT_FOUND and AMBIGUOUS_MATCH error handling to complete_task tool

**Checkpoint**: User Story 3 complete - Can complete tasks via chat

---

## Phase 6: User Story 4 - Delete Task via Chat (Priority: P2)

**Goal**: Users can delete tasks by saying "Remove the grocery task" or "Delete buy groceries"

**Independent Test**: Delete existing task via chat, verify task removed from database

**Implements**: FR-006 (delete_task), FR-007, FR-008 (not found), FR-009

### MCP Tool: delete_task

- [x] T029 [US4] Implement delete_task MCP tool in backend/app/mcp/tools.py with task matching and confirmation response
- [x] T030 [US4] Add TASK_NOT_FOUND error handling to delete_task tool

**Checkpoint**: User Story 4 complete - Can delete tasks via chat

---

## Phase 7: User Story 5 - Update Task via Chat (Priority: P3)

**Goal**: Users can update task title/description by saying "Change the grocery task to buy organic groceries"

**Independent Test**: Update existing task via chat, verify changes persisted in database

**Implements**: FR-006 (update_task), FR-007, FR-008 (not found), FR-009

### MCP Tool: update_task

- [x] T031 [US5] Implement update_task MCP tool in backend/app/mcp/tools.py supporting title and description updates
- [x] T032 [US5] Add TASK_NOT_FOUND, AMBIGUOUS_MATCH, NO_CHANGES error handling to update_task tool

**Checkpoint**: User Story 5 complete - Can update tasks via chat

---

## Phase 8: User Story 6 - Conversation Context (Priority: P2)

**Goal**: Chatbot remembers conversation context for natural follow-up interactions

**Independent Test**: Perform sequence (list tasks, "complete the first one"), verify context understood

**Implements**: FR-003, FR-004, FR-015

### Context Persistence

- [x] T033 [US6] Implement context loading in chat endpoint: query last 50 messages from conversation
- [x] T034 [US6] Format conversation history for agent input (user/assistant message pairs)
- [x] T035 [US6] Implement message persistence: save user message before agent call, save assistant message after

**Checkpoint**: User Story 6 complete - Conversation context maintained across requests

---

## Phase 9: User Story 7 - Chain Multiple Actions (Priority: P3)

**Goal**: Users can perform multiple actions in one message like "Add buy milk and mark groceries as done"

**Independent Test**: Send compound request, verify all actions executed and confirmed

**Implements**: FR-010

### Agent Enhancement

- [x] T036 [US7] Update agent system prompt in backend/app/services/agent.py to handle compound requests
- [x] T037 [US7] Ensure agent can chain multiple MCP tool calls in single response

**Checkpoint**: User Story 7 complete - Compound requests supported

---

## Phase 10: Polish & Cross-Cutting Concerns

**Purpose**: Error handling, rate limiting, and documentation

### Error Handling

- [x] T038 [P] Implement graceful error responses for DB errors in chat endpoint (500 with friendly message)
- [x] T039 [P] Add input validation for chat message (max 2000 chars) in backend/app/schemas/chat.py
- [x] T040 [P] Implement user_id mismatch check (403 Forbidden) in chat endpoint

### Rate Limiting

- [x] T041 Implement rate limiting middleware (60 req/min per user) in backend/app/routers/chat.py

### Frontend Polish

- [x] T042 [P] Add loading state and error display to ChatInterface component
- [x] T043 [P] Add streaming response handling (SSE) to ChatInterface if needed
- [x] T044 [P] Add navigation link to chat page from main app layout

### Documentation

- [x] T045 [P] Update backend/README.md with chat endpoint documentation and MCP server startup instructions
- [x] T046 [P] Update frontend/README.md with chat UI setup instructions
- [x] T047 Validate setup by running quickstart.md steps end-to-end

---

## Dependencies & Execution Order

### Phase Dependencies

```
Phase 1: Setup
    ↓
Phase 2: Foundational (BLOCKS ALL USER STORIES)
    ↓
Phase 3-9: User Stories (can proceed in priority order or parallel)
    ↓
Phase 10: Polish
```

### User Story Dependencies

| Story | Depends On | Can Start After |
|-------|------------|-----------------|
| US1 (Add Task) | Foundational | Phase 2 complete |
| US2 (List Tasks) | Foundational | Phase 2 complete |
| US3 (Complete Task) | Foundational | Phase 2 complete |
| US4 (Delete Task) | Foundational | Phase 2 complete |
| US5 (Update Task) | Foundational | Phase 2 complete |
| US6 (Context) | Foundational | Phase 2 complete |
| US7 (Chaining) | Foundational | Phase 2 complete |

**Note**: All user stories are technically independent after Foundational phase. For logical testing, US1+US2 should complete first as they provide tasks for US3-US5 to operate on.

### Within Each Phase

1. MCP tools before chat endpoint integration
2. Backend before frontend
3. Core functionality before error handling

### Parallel Opportunities

**Phase 1 (all parallel)**:
```bash
T001 (backend deps) | T002 (frontend deps) | T003 (env vars)
T004 (mcp dir) | T005 (services dir) | T006 (frontend dirs)
```

**Phase 2 (models parallel, then services)**:
```bash
T007 (Conversation) | T008 (Message)  # Models in parallel
T013 (MCP server) | T015 (Agent config)  # Core services in parallel
```

**Phase 10 (mostly parallel)**:
```bash
T038 | T039 | T040  # Error handling in parallel
T042 | T043 | T044  # Frontend in parallel
T045 | T046  # Docs in parallel
```

---

## Parallel Example: Phase 1 Setup

```bash
# Launch all setup tasks together (6 tasks, all [P]):
Task: "T001 Add backend dependencies..."
Task: "T002 Add frontend dependency..."
Task: "T003 Add new environment variables..."
Task: "T004 Create MCP package directory..."
Task: "T005 Create services directory..."
Task: "T006 Create frontend chat directory..."
```

---

## Implementation Strategy

### MVP First (User Stories 1 + 2)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational
3. Complete Phase 3: User Story 1 (Add Task)
4. Complete Phase 4: User Story 2 (List Tasks)
5. **STOP and VALIDATE**: Test add + list flow end-to-end
6. Deploy/demo basic chat functionality

### Incremental Delivery

1. Setup + Foundational → Infrastructure ready
2. Add US1 + US2 → Basic CRUD demo (MVP!)
3. Add US3 + US4 → Complete task lifecycle
4. Add US6 → Context-aware conversations
5. Add US5 + US7 → Power user features
6. Polish → Production-ready

### Single Developer Path

```
T001-T006 → T007-T017 → T018-T025 → T026 → T027-T028 → T029-T030 → T031-T032 → T033-T035 → T036-T037 → T038-T047
   Setup       Found.       US1        US2      US3          US4         US5         US6          US7       Polish
```

---

## Open Questions & Assumptions

### Assumptions Made

1. **Existing Task model unchanged**: No schema modifications needed for Task entity
2. **Better Auth working**: JWT verification via existing auth.py module
3. **Single conversation per user**: First implementation uses one active conversation (can extend later)
4. **Gemini API available**: Valid GEMINI_API_KEY will be provided in .env
5. **MCP SDK compatible**: mcp package works with FastAPI/Python 3.11+

### Open Questions

1. **Streaming vs JSON**: Should chat responses stream via SSE or return complete JSON?
   - Default: JSON response (simpler)
   - Streaming: Add T043 implementation if needed

2. **Conversation expiry**: Should old conversations be archived/deleted?
   - Assumption: Keep all messages indefinitely for now

3. **MCP server deployment**: Run as separate process or embedded in FastAPI?
   - Plan suggests: Separate process on port 8001
   - Alternative: Embed in FastAPI startup

---

## Summary

| Metric | Count |
|--------|-------|
| Total Tasks | 47 |
| Setup Tasks | 6 |
| Foundational Tasks | 11 |
| User Story Tasks | 20 |
| Polish Tasks | 10 |
| Parallelizable Tasks | 24 |

| User Story | Task Count | Priority |
|------------|------------|----------|
| US1: Add Task | 8 | P1 (MVP) |
| US2: List Tasks | 1 | P1 (MVP) |
| US3: Complete Task | 2 | P2 |
| US4: Delete Task | 2 | P2 |
| US5: Update Task | 2 | P3 |
| US6: Context | 3 | P2 |
| US7: Chaining | 2 | P3 |

**MVP Scope**: Phase 1-4 (Setup + Foundational + US1 + US2) = 26 tasks
