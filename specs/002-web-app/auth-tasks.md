# Implementation Tasks: JWT Authentication Integration

**Feature**: 002-web-app (Authentication Enhancement)
**Branch**: `002-web-app`
**Created**: 2026-01-08
**Plan**: [auth-plan.md](./auth-plan.md) | **Spec**: [auth-spec.md](./auth-spec.md)

## Overview

This document breaks down the JWT authentication integration into granular, testable tasks organized by user story priority. Each user story represents an independently testable increment of functionality that adds authentication capabilities to the existing backend API and creates a new Next.js frontend.

**Total Tasks**: 35
**MVP Scope**: User Story 1 (Registration/Sign In) + User Story 2 (Authenticated Task Operations) - 18 tasks
**Full Feature**: All 4 user stories - 35 tasks

## Task Organization

Tasks are organized into phases:
1. **Phase 1**: Backend Auth Infrastructure (5 tasks) - BLOCKS User Story 2
2. **Phase 2**: User Story 1 - User Registration and Sign In [P1] (7 tasks)
3. **Phase 3**: User Story 2 - Authenticated Task Operations [P1] (6 tasks)
4. **Phase 4**: User Story 3 - Token Expiry and Session Management [P2] (4 tasks)
5. **Phase 5**: User Story 4 - Secure Token Storage and Transmission [P2] (3 tasks)
6. **Phase 6**: Testing & Documentation (10 tasks)

---

## Phase 1: Backend Auth Infrastructure

**Goal**: Create JWT verification infrastructure that all authenticated endpoints will depend on

**Satisfies**: Foundation for all user stories (backend verification layer)

**Blocking**: User Story 2 (cannot protect endpoints without auth dependency)

- [ ] T001 Add PyJWT>=2.8.0 to backend/requirements.txt
- [ ] T002 Add BETTER_AUTH_SECRET to backend/.env.example with template value and security note
- [ ] T003 Create backend/app/auth.py module with get_current_user dependency function that uses HTTPBearer to extract token from Authorization header
- [ ] T004 Implement JWT verification logic in backend/app/auth.py: decode token with PyJWT using BETTER_AUTH_SECRET and HS256 algorithm, validate signature and expiry
- [ ] T005 Add error handling to get_current_user in backend/app/auth.py: raise HTTPException 401 for missing/invalid/expired tokens with appropriate detail messages

---

## Phase 2: User Story 1 - User Registration and Sign In [P1]

**Story Goal**: Users can create accounts and sign in to receive JWT tokens for accessing the application

**Priority**: P1 (Core authentication foundation)

**Satisfies**: FR-001 (Better Auth), FR-002 (JWT issuance), FR-003 (user identity claims), auth-spec.md User Story 1

**Independent Test Criteria**:
- [ ] Sign up with email/password creates account and issues JWT with sub claim
- [ ] Sign in with correct credentials issues JWT token
- [ ] Sign in with incorrect credentials fails without issuing token
- [ ] Backend verifies JWT signature and extracts user_id from sub claim

**Implementation Tasks**:

- [ ] T006 [US1] Initialize Next.js frontend project in frontend/ directory with TypeScript and App Router configuration
- [ ] T007 [US1] Install Better Auth dependencies: npm install better-auth in frontend/ directory
- [ ] T008 [US1] Create frontend/src/lib/auth.ts with Better Auth server configuration including JWT plugin from better-auth/plugins
- [ ] T009 [US1] Configure Better Auth in frontend/src/lib/auth.ts with BETTER_AUTH_SECRET from environment variable and database connection for user storage
- [ ] T010 [US1] Create Better Auth API route at frontend/src/app/api/auth/[...all]/route.ts to handle authentication requests
- [ ] T011 [US1] Create frontend/src/lib/auth-client.ts with Better Auth client configuration including jwtClient plugin from better-auth/client/plugins
- [ ] T012 [US1] Add BETTER_AUTH_SECRET and DATABASE_URL (for Better Auth) to frontend/.env.local.example with documentation

---

## Phase 3: User Story 2 - Authenticated Task Operations [P1]

**Story Goal**: Authenticated users can securely access only their own tasks via JWT-protected API endpoints

**Priority**: P1 (Core value proposition - secure data isolation)

**Satisfies**: FR-007 (user_id extraction), FR-008 (401 errors), FR-009 (403 errors), FR-010 (zero trust), auth-spec.md User Story 2

**Depends On**: Phase 1 (backend auth infrastructure must exist)

**Independent Test Criteria**:
- [ ] Authenticated request with valid JWT returns user's tasks only
- [ ] User1 cannot access User2's tasks even with valid JWT (403)
- [ ] Unauthenticated request without JWT returns 401
- [ ] Request with expired/invalid JWT returns 401

**Implementation Tasks**:

- [ ] T013 [US2] Import get_current_user from backend/app/auth in backend/app/routers/tasks.py
- [ ] T014 [US2] Add authenticated_user parameter to GET /api/{user_id}/tasks endpoint: authenticated_user: str = Depends(get_current_user)
- [ ] T015 [US2] Add ownership validation to GET /api/{user_id}/tasks: if authenticated_user != user_id raise HTTPException 403 with detail message
- [ ] T016 [US2] Update database query in GET /api/{user_id}/tasks to use authenticated_user instead of URL user_id for Task.user_id filter
- [ ] T017 [P] [US2] Apply same auth pattern (T014-T016) to POST /api/{user_id}/tasks endpoint
- [ ] T018 [P] [US2] Apply same auth pattern (T014-T016) to remaining 4 endpoints: GET /tasks/{id}, PUT /tasks/{id}, DELETE /tasks/{id}, PATCH /tasks/{id}/complete

---

## Phase 4: User Story 3 - Token Expiry and Session Management [P2]

**Story Goal**: Expired JWT tokens are rejected by backend and handled gracefully by frontend

**Priority**: P2 (Security refinement after basic auth works)

**Satisfies**: FR-004 (expiry enforcement), auth-spec.md User Story 3

**Depends On**: Phase 2 (Better Auth must be configured), Phase 3 (endpoints must be protected)

**Independent Test Criteria**:
- [ ] Backend rejects tokens past expiry timestamp with 401
- [ ] Frontend detects 401 response and redirects to sign-in
- [ ] Valid unexpired tokens proceed without re-authentication

**Implementation Tasks**:

- [ ] T019 [US3] Configure JWT token expiry in frontend/src/lib/auth.ts: set expirationTime to 86400 seconds (24 hours) in JWT plugin config
- [ ] T020 [US3] Verify backend/app/auth.py handles jwt.ExpiredSignatureError and raises HTTPException 401 with "Token expired" detail
- [ ] T021 [US3] Create frontend/src/lib/api-client.ts with fetch wrapper that handles 401 responses by redirecting to /auth/signin
- [ ] T022 [US3] Add token expiry test to backend tests: create expired JWT, attempt API call, verify 401 response

---

## Phase 5: User Story 4 - Secure Token Storage and Transmission [P2]

**Story Goal**: JWT tokens are securely stored and transmitted via Authorization header, never exposed in URLs

**Priority**: P2 (Security best practice after auth flow works)

**Satisfies**: FR-005 (Authorization header), FR-013 (prevent unauthenticated access), auth-spec.md User Story 4

**Depends On**: Phase 2 (Better Auth client must exist), Phase 4 (API client must exist)

**Independent Test Criteria**:
- [ ] JWT retrieved from Better Auth via authClient.token()
- [ ] All API requests include Authorization: Bearer <token> header
- [ ] Tokens not visible in URL parameters or plain localStorage

**Implementation Tasks**:

- [ ] T023 [US4] Update frontend/src/lib/api-client.ts to retrieve JWT via authClient.token() before each API request
- [ ] T024 [US4] Add Authorization: Bearer <token> header to all fetch calls in frontend/src/lib/api-client.ts
- [ ] T025 [US4] Verify Better Auth stores tokens securely (httpOnly cookies or secure session storage) by inspecting Better Auth client configuration

---

## Phase 6: Testing & Documentation

**Goal**: Comprehensive testing coverage and complete documentation for authentication setup

**Satisfies**: All success criteria from auth-spec.md, plan.md testing strategy

- [ ] T026 Create backend/tests/test_auth.py with tests for get_current_user dependency: valid token, expired token, invalid signature, missing token
- [ ] T027 Update backend/tests/conftest.py to add create_test_jwt fixture that generates valid JWTs signed with test BETTER_AUTH_SECRET
- [ ] T028 Update all 38 tests in backend/tests/test_tasks.py to include Authorization header with valid JWT using create_test_jwt fixture
- [ ] T029 [P] Add 6 new auth tests to backend/tests/test_tasks.py: no token (401), invalid token (401), expired token (401), wrong user (403), valid token (200), cross-user access blocked
- [ ] T030 [P] Create frontend auth UI: frontend/src/app/auth/signup/page.tsx with email/password form calling Better Auth signup
- [ ] T031 [P] Create frontend auth UI: frontend/src/app/auth/signin/page.tsx with email/password form calling Better Auth signin
- [ ] T032 Create frontend/src/services/tasks.ts with authenticated API methods: getAllTasks, createTask, updateTask, deleteTask, toggleComplete using api-client
- [ ] T033 Create frontend/src/app/tasks/page.tsx with task list view that fetches and displays tasks using tasks service
- [ ] T034 Update backend/README.md with JWT authentication section: BETTER_AUTH_SECRET setup, token verification process, authenticated API examples
- [ ] T035 Create specs/002-web-app/auth-quickstart.md with end-to-end setup guide: secret generation, environment configuration, local development workflow

---

## Dependencies & Execution Order

### Story Dependency Graph

```
Phase 1 (Backend Auth Infrastructure)
          ↓
    BLOCKS User Story 2
          ↓
┌─────────┴─────────────────────┐
│                               │
Phase 2 (US1: Registration)  Phase 3 (US2: Auth Task Operations)
│                               │
└───────┬─────────────┬─────────┘
        ↓             ↓
   Phase 4 (US3)  Phase 5 (US4)
        │             │
        └──────┬──────┘
               ↓
        Phase 6 (Testing & Docs)
```

**Critical Path**: Backend Infrastructure → US1 (Registration) → US2 (Authenticated Operations) → Testing

**Blocking Relationships**:
- Phase 1 BLOCKS Phase 3 (cannot protect endpoints without auth infrastructure)
- Phase 2 must complete before Phase 4 (token expiry requires Better Auth configured)
- Phase 3 must complete before Phase 4 (expiry handling requires protected endpoints)
- Phase 2 must complete before Phase 5 (token transmission requires auth client)
- Phase 4 must complete before Phase 5 (secure transmission requires API client with error handling)

**Parallel Opportunities**:
- Phase 2 (US1) and Phase 1 setup can overlap if working on different services (frontend vs backend)
- Within Phase 3: T017 and T018 are parallelizable (different endpoint groups)
- Within Phase 6: T026-T029 (backend tests) can run parallel to T030-T033 (frontend UI)

### Independent Testing Per Story

**User Story 1 (Registration/Sign In)**:
- Test Case 1: Sign up with new email → account created, JWT issued
- Test Case 2: Sign in with correct credentials → JWT issued
- Test Case 3: Sign in with wrong password → no token, error message
- Test Case 4: Backend validates JWT → extracts user_id from sub claim

**User Story 2 (Authenticated Operations)**:
- Test Case 1: Valid JWT → user's tasks returned
- Test Case 2: No JWT → 401 Unauthorized
- Test Case 3: Invalid JWT → 401 Unauthorized
- Test Case 4: User1 JWT accessing User2 tasks → 403 Forbidden

**User Story 3 (Token Expiry)**:
- Test Case 1: Expired token → backend returns 401
- Test Case 2: Frontend receives 401 → redirects to sign-in
- Test Case 3: Unexpired token → request proceeds normally

**User Story 4 (Secure Transmission)**:
- Test Case 1: Inspect network traffic → Authorization header present
- Test Case 2: Inspect browser → token not in URL params
- Test Case 3: All requests → include Bearer token

---

## Parallel Execution Strategy

### MVP Parallel Track (US1 + US2)
Tasks that can be executed in parallel after Phase 1 completes:

**Track A (Frontend Auth Setup)**:
- T006-T012 (US1 frontend setup)

**Track B (Backend Endpoint Protection)**:
- T013-T018 (US2 endpoint authentication)

Both tracks can proceed independently and merge at Phase 6 for integration testing.

### Full Feature Parallel Tracks
After MVP (US1 + US2) complete:

**Track C (Token Management)**:
- T019-T022 (US3 expiry handling)

**Track D (Secure Storage)**:
- T023-T025 (US4 token transmission)

**Track E (Testing)**:
- T026-T029 (backend tests)

**Track F (Frontend UI)**:
- T030-T033 (auth pages and task UI)

All tracks converge at T034-T035 for documentation.

---

## Implementation Strategy

### MVP Scope (18 tasks)
**Goal**: Deliver core authentication with secure task access

**Includes**:
- Phase 1: Backend Auth Infrastructure (T001-T005)
- Phase 2: User Story 1 - Registration/Sign In (T006-T012)
- Phase 3: User Story 2 - Authenticated Task Operations (T013-T018)

**Delivers**:
- Users can sign up and sign in
- JWT tokens issued by Better Auth
- Backend verifies tokens and enforces ownership
- All 6 task endpoints require authentication
- Cross-user access blocked

**MVP Validation**:
1. Sign up new user → JWT received
2. Create task with JWT → task stored with user_id from token
3. Attempt to access another user's tasks → 403 Forbidden
4. Attempt request without JWT → 401 Unauthorized

### Incremental Delivery Beyond MVP

**Phase 4 (US3) adds**: Token expiry enforcement and graceful error handling
**Phase 5 (US4) adds**: Secure token storage and transmission best practices
**Phase 6 adds**: Comprehensive test coverage and complete documentation

Each phase delivers independently testable security improvements.

---

## Validation Checklist

Before marking tasks complete, verify:

- [ ] All 35 tasks follow strict checklist format (checkbox + ID + optional P/Story + description + file path)
- [ ] Each user story phase has clear independent test criteria
- [ ] Blocking relationships documented (Phase 1 blocks Phase 3)
- [ ] Parallel opportunities identified (8 tasks marked [P])
- [ ] MVP scope clearly defined (18 tasks)
- [ ] Dependency graph shows story completion order
- [ ] All tasks reference specific file paths
- [ ] Each task is specific enough for LLM execution without additional context

---

## Task Completion Tracking

**Phase 1: Backend Auth Infrastructure** [0/5]
**Phase 2: User Story 1 - Registration/Sign In [P1]** [0/7]
**Phase 3: User Story 2 - Authenticated Operations [P1]** [0/6]
**Phase 4: User Story 3 - Token Expiry [P2]** [0/4]
**Phase 5: User Story 4 - Secure Transmission [P2]** [0/3]
**Phase 6: Testing & Documentation** [0/10]

**Total Progress**: 0/35 tasks complete

---

## Notes

- **Tests are manual verification**: No automated test suite required by spec, validation through manual testing scenarios
- **Backend changes are additive**: No breaking changes to existing 6 endpoints, only adding authentication layer
- **Frontend is new codebase**: Starting from scratch with Next.js + Better Auth
- **Security first**: Backend protection (Phase 1-3) before frontend UI (Phase 6)
- **Stateless architecture**: No backend session storage, JWT self-contained
- **Zero trust**: Backend never trusts URL user_id, always uses authenticated user from JWT

---

## References

- [auth-spec.md](./auth-spec.md) - Feature specification with user stories
- [auth-plan.md](./auth-plan.md) - 8-phase implementation plan
- [auth-research.md](./auth-research.md) - Technical research findings
- Better Auth Documentation: https://www.better-auth.com
- FastAPI Security: https://fastapi.tiangolo.com/tutorial/security/
