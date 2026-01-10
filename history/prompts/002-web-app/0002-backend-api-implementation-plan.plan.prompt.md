---
id: 0002
title: Backend API Implementation Plan
stage: plan
date: 2026-01-08
surface: agent
model: claude-sonnet-4-5
feature: 002-web-app
branch: 002-web-app
user: anaslinux
command: /sp.plan
labels: ["backend", "api", "fastapi", "sqlmodel", "neon", "architecture", "design"]
links:
  spec: specs/002-web-app/spec.md
  ticket: null
  adr: null
  pr: null
files:
 - specs/002-web-app/plan.md
 - specs/002-web-app/research.md
 - specs/002-web-app/data-model.md
 - specs/002-web-app/quickstart.md
 - specs/002-web-app/contracts/openapi.yaml
tests:
 - Constitution compliance check (all principles adhered to)
 - Planning gate verification (all items passed)
---

## Prompt

Backend REST API & Persistent Data Layer

Goal: Produce a clear, implementation-ready plan that translates the backend specification into an agent-executable roadmap, ensuring correctness, scalability, and alignment with Spec-Kit Plus principles.

User Requirements Summary:
- Transform single-user in-memory CLI Todo to multi-user persistent RESTful backend
- 6 REST API endpoints (create, list, get, update, delete, toggle completion)
- User-scoped data isolation (user_id filtering)
- FastAPI + SQLModel + Neon Serverless PostgreSQL
- No authentication in this phase (user_id via URL placeholder)
- Async-compatible design
- Clear separation of concerns (routes, models, schemas, database)

Architecture Requirements:
- Research best practices for FastAPI + SQLModel + Neon integration
- Define SQLModel Task schema with timestamps and user ownership
- Design REST endpoint behaviors mapping CLI commands to REST semantics
- Establish error-handling patterns (404, 400)
- Validate user-scoped filtering logic
- Prepare for future JWT auth middleware insertion

Decision Matrix:
- ORM choice: SQLModel vs SQLAlchemy (Pydantic integration)
- Database type: Neon PostgreSQL for persistence + multi-user
- Sync vs Async: Async improves scalability but increases complexity
- User scoping: URL-based user_id keeps API stable pre-auth
- Delete strategy: Hard delete simplifies MVP

Testing Strategy:
- Acceptance-based validation (create → persists, restart → data remains)
- User isolation tests (access other user's task → 404)
- Negative testing (invalid IDs, malformed requests)

Quality Requirements:
- All endpoints align with specification
- No cross-user data leakage
- Database schema supports future JWT filtering
- Business logic separated from routing

## Response snapshot

Successfully created comprehensive implementation plan with complete architecture, design artifacts, and execution strategy.

**Phase 0 - Research** (completed):
- Resolved 6 key unknowns via Context7 MCP (FastAPI patterns, SQLModel integration, Neon configuration)
- Validated technology stack: FastAPI 0.115+, SQLModel 0.0.24+, Neon PostgreSQL pooled connections
- Documented dependency injection pattern with yield, timestamp strategies, user isolation queries
- Created research.md with rationale for all technical decisions

**Phase 1 - Design & Contracts** (completed):
- Created data-model.md: Task entity with 7 fields, validation rules, SQLModel implementation, query patterns
- Generated OpenAPI 3.1 contract: Complete specification with 6 endpoints, request/response schemas, error formats
- Wrote quickstart.md: Setup instructions, environment configuration, testing guide, troubleshooting
- Defined concrete project structure: backend/app/ with routes, models, schemas, database separation

**Architecture Decisions**:
- SQLModel as ORM (type-safe, Pydantic integration, FastAPI-native)
- Sync engine with SQLModel (stable API, simpler than async, FastAPI handles framework-level async)
- URL-based user_id (Phase 1) for API stability, JWT extraction deferred to Phase 2
- Hard delete strategy (simplifies MVP, no audit requirements)
- Per-request session lifecycle (standard FastAPI dependency injection pattern)
- Generic 404 responses (security: don't leak task existence to unauthorized users)

**ADR Recommendations**:
- SQLModel ORM Selection (significant: affects all data access, multiple alternatives, cross-cutting)
- Pre-Authentication API Design (significant: API contract stability, JWT timing trade-offs, auth strategy)

**Constitution Compliance**: ✅ All 10 principles adhered to, no violations, all gates passed.

## Outcome

- ✅ Impact: Complete implementation-ready plan with architecture, design artifacts, and clear execution path. Foundation established for multi-user persistent task management with FastAPI + SQLModel + Neon PostgreSQL.
- 🧪 Tests: Planning gate passed (6/6 items). Constitution compliance verified (10/10 principles). Testing strategy defined with 40+ test cases across 6 user stories.
- 📁 Files: Created plan.md (comprehensive architecture), research.md (6 decisions resolved), data-model.md (Task entity + schemas), quickstart.md (developer guide), contracts/openapi.yaml (complete API spec)
- 🔁 Next prompts: Ready for /sp.tasks to generate implementation tasks, then /sp.implement for code generation. Optional: /sp.adr to document SQLModel and pre-auth design decisions.
- 🧠 Reflection: Plan successfully balances technical rigor with pragmatic MVP scope. User-scoped data isolation enforced at query level. API designed for future JWT integration without breaking changes. All unknowns resolved via Context7 research ensuring current best practices.

## Evaluation notes (flywheel)

- Failure modes observed: None. All research questions resolved via Context7 MCP. No ambiguities or blockers remain.
- Graders run and results (PASS/FAIL): Specification Gate: PASS (5/5 items). Planning Gate: PASS (6/6 items). Constitution Check: PASS (10/10 principles). ADR Significance Test: 2 significant decisions identified.
- Prompt variant (if applicable): Standard /sp.plan workflow with user-provided architecture sketch and decision matrix
- Next experiment (smallest change to try): None required - plan is complete, validated, and ready for task generation
