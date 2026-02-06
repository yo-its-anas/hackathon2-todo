---
id: "0002"
title: "Create AI Chatbot Implementation Plan"
stage: plan
date: 2026-02-03
surface: agent
model: claude-opus-4-5-20251101
feature: 003-ai-chatbot
branch: 003-ai-chatbot
user: anaslinux
command: /sp.plan
labels: ["ai-chatbot", "mcp", "planning", "architecture", "phase-3"]
links:
  spec: specs/003-ai-chatbot/spec.md
  ticket: null
  adr: null
  pr: null
files:
  - specs/003-ai-chatbot/plan.md
  - specs/003-ai-chatbot/research.md
  - specs/003-ai-chatbot/data-model.md
  - specs/003-ai-chatbot/quickstart.md
  - specs/003-ai-chatbot/contracts/chat-api.yaml
  - specs/003-ai-chatbot/contracts/mcp-tools.yaml
tests:
  - N/A (planning phase)
---

## Prompt

Generate a detailed implementation plan for the Todo AI Chatbot
based strictly on the provided spec.

PLAN FORMAT REQUIREMENTS
- Step-by-step
- File-by-file
- Folder-by-folder
- Clear execution order
- No code yet, only plan

INCLUDE THESE SECTIONS

1. High-level architecture flow
2. Backend folder structure
3. MCP server setup plan
4. MCP tool definitions plan
5. Agent setup plan (model-agnostic, Gemini-compatible)
6. Chat endpoint request lifecycle
7. Conversation persistence strategy
8. Error handling strategy
9. Frontend ChatKit integration plan
10. Environment variables & secrets
11. Local dev vs production considerations
12. Testing strategy (manual + replayable requests)

IMPORTANT CONSTRAINTS
- Agent must use MCP tools exclusively
- MCP tools must be stateless
- Agent runner must support Gemini API
- ChatKit must only talk to FastAPI backend

## Response snapshot

Generated comprehensive implementation plan with 6 phases:

**Phase 0 Research** (research.md):
- MCP Python SDK: FastMCP with decorator-based tools
- OpenAI Agents SDK: LitellmModel for Gemini integration
- ChatKit: Server mode with FastAPI backend proxy

**Phase 1 Design** (data-model.md, contracts/):
- New entities: Conversation, Message
- Chat API contract: OpenAPI 3.1 spec for /api/{user_id}/chat
- MCP tool definitions: 5 stateless tools (add, list, complete, delete, update)

**Architecture Highlights**:
- Stateless design with DB-loaded context (50 messages max)
- MCP tools execute all DB operations (agent never touches DB directly)
- Model-agnostic via LiteLLM (swap Gemini/Claude/GPT via env var)
- ChatKit UI-only (no client LLM calls)

**Implementation Phases**:
1. Database & Models (Conversation, Message)
2. MCP Server (5 tools)
3. Agent Integration (LiteLLM + MCP)
4. Chat Endpoint (request lifecycle)
5. Frontend (ChatKit integration)
6. Testing & Polish

All 10 constitution principles pass. Ready for /sp.tasks.

## Outcome

- Impact: Complete architecture and design for AI chatbot feature
- Tests: N/A (planning phase)
- Files: 6 design artifacts created
- Next prompts: /sp.tasks to generate implementation tasks, then /sp.implement
- Reflection: Context7 research critical for current MCP SDK and Agents SDK patterns

## Evaluation notes (flywheel)

- Failure modes observed: None - comprehensive spec enabled smooth planning
- Graders run and results (PASS/FAIL): Constitution Check PASS (10/10 principles)
- Prompt variant (if applicable): N/A
- Next experiment (smallest change to try): N/A - proceed to task generation
