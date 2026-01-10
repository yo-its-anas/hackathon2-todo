# Implementation Plan: JWT Authentication Integration

**Branch**: `002-web-app` | **Date**: 2026-01-08 | **Spec**: [auth-spec.md](./auth-spec.md)
**Input**: Authentication specification from `/specs/002-web-app/auth-spec.md`

## Summary

This plan details the integration of stateless JWT authentication into the existing Todo Full-Stack Web Application. The implementation adds Better Auth (Next.js frontend) with JWT token issuance and FastAPI backend with cryptographic token verification, upgrading from assumed `user_id` access to cryptographically verified user identity. This ensures zero cross-user data leakage through signature validation and ownership enforcement.

**Core Approach**: Shared secret (`BETTER_AUTH_SECRET`) enables Better Auth to sign JWTs on the frontend and FastAPI to verify signatures on the backend without network calls, maintaining stateless architecture.

## Technical Context

**Language/Version**:
- Frontend: TypeScript/JavaScript (Next.js 15+ App Router)
- Backend: Python 3.13+

**Primary Dependencies**:
- Frontend: Better Auth (`better-auth`), JWT plugin (`better-auth/plugins`), JWT client (`better-auth/client/plugins`)
- Backend: PyJWT (2.8+), FastAPI security (`HTTPBearer`, `HTTPAuthCredentials`)

**Storage**:
- Existing: Neon PostgreSQL (tasks data)
- New: Better Auth database tables (users, sessions) - separate from backend

**Testing**:
- Frontend: Jest / Vitest for auth integration tests
- Backend: pytest with httpx client for authenticated endpoint testing

**Target Platform**:
- Frontend: Browser (Next.js SSR + Client Components)
- Backend: Linux server (ASGI - Uvicorn)

**Project Type**: Web (full-stack with separate frontend and backend)

**Performance Goals**:
- JWT verification overhead: <50ms per request
- Token retrieval from Better Auth: <100ms
- No degradation to existing task operations

**Constraints**:
- Stateless authentication only (no backend session storage)
- Must use Better Auth (specification requirement)
- JWT verification only (no OAuth introspection)
- API paths unchanged (backward compatible URLs)
- Zero trust in client-supplied identifiers

**Scale/Scope**:
- Multi-user todo application (100-10,000 users)
- 6 existing API endpoints require authentication
- 4 user stories (2 P1, 2 P2)
- 15 functional requirements

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### I. Spec-Driven Lifecycle ✅ PASS
- Specification complete ([auth-spec.md](./auth-spec.md))
- Planning in progress (this document)
- Tasks will follow via `/sp.tasks`
- Implementation via `/sp.implement` only

### II. No Code Without Authorization ✅ PASS
- All implementation will be authorized by tasks.md
- Traceability: Tasks → Plan → Spec
- No premature coding

### III. AI-Only Implementation ✅ PASS
- No manual coding planned
- All code generation via `/sp.implement` command
- Human approval at spec and plan stages only

### IV. Clarification Over Assumptions ✅ PASS
- All technical unknowns resolved in [auth-research.md](./auth-research.md)
- 6 research questions answered via Context7
- No ambiguous requirements remaining

### V. Clean Code Standards ✅ PASS
- Authentication logic separated into dedicated modules
- Single Responsibility: Auth dependency handles only verification
- DRY: Reusable `get_current_user` dependency across endpoints
- Clear naming: `authenticated_user` vs `user_id` (URL parameter)

### VI. Technology Stack Adherence ✅ PASS
- Better Auth: Mandated by specification
- FastAPI + PyJWT: Standard Python JWT verification
- HS256: Industry-standard symmetric signing
- All choices documented in research.md

### VII. State Management Discipline ✅ PASS
- Stateless JWT verification (no backend state)
- No shared session database between frontend/backend
- Token self-contained (all data in payload + signature)

### VIII. Traceability ✅ PASS
- Research (auth-research.md) → Plan (this file) → Tasks (pending)
- All decisions reference Context7 sources
- ADR candidates: JWT algorithm choice, dependency injection pattern

### IX. Mandatory Documentation ✅ PASS
- Specification: Complete with 4 user stories, 15 FRs
- Research: 6 questions answered
- Plan: Architecture and implementation phases documented
- Quickstart: To be generated in Phase 1

### X. External Knowledge via Context7 ✅ PASS
- Better Auth JWT plugin: `/www.better-auth.com/llmstxt`
- FastAPI Security: `/websites/fastapi_tiangolo`
- All research queries documented with sources

**GATE RESULT**: ✅ ALL CHECKS PASS - Proceed to Phase 0

## Project Structure

### Documentation (this feature)

```text
specs/002-web-app/
├── spec.md               # Original backend API spec
├── auth-spec.md          # NEW: Authentication spec
├── plan.md               # Original backend plan
├── auth-plan.md          # NEW: This file (authentication plan)
├── research.md           # Original backend research
├── auth-research.md      # NEW: JWT authentication research
├── auth-data-model.md    # Phase 1 output (auth entities)
├── auth-quickstart.md    # Phase 1 output (setup guide)
├── contracts/
│   └── auth-openapi.yaml # Phase 1 output (auth endpoints - if any new ones)
└── tasks.md              # Phase 2 output (will be updated with auth tasks)
```

### Source Code (repository root)

```text
backend/
├── app/
│   ├── main.py                # UPDATE: Import auth dependency
│   ├── database.py            # No changes
│   ├── dependencies.py        # UPDATE: Add auth dependencies
│   ├── auth.py                # NEW: JWT verification logic
│   ├── models/
│   │   └── task.py            # UPDATE: user_id remains string (from JWT sub)
│   ├── schemas/
│   │   └── task.py            # No changes (validation unchanged)
│   └── routers/
│       └── tasks.py           # UPDATE: Add auth dependency to all endpoints
├── tests/
│   ├── conftest.py            # UPDATE: Add JWT token fixtures
│   ├── test_models.py         # No changes
│   └── test_tasks.py          # UPDATE: Add auth headers to all requests
├── requirements.txt           # UPDATE: Add PyJWT
├── .env.example               # UPDATE: Add BETTER_AUTH_SECRET
└── README.md                  # UPDATE: Auth setup instructions

frontend/                      # NEW: Next.js frontend with Better Auth
├── src/
│   ├── lib/
│   │   └── auth.ts            # Better Auth configuration + JWT plugin
│   ├── app/
│   │   ├── auth/
│   │   │   ├── signin/page.tsx
│   │   │   └── signup/page.tsx
│   │   ├── tasks/page.tsx     # Main task list view
│   │   └── layout.tsx         # Root layout with auth provider
│   └── components/
│       └── auth/              # Sign in/up forms
├── .env.local.example         # BETTER_AUTH_SECRET, BACKEND_URL
└── package.json               # Better Auth dependencies
```

**Structure Decision**: Web application structure with existing backend enhanced for JWT verification and new Next.js frontend with Better Auth integration. Backend changes are additive (no breaking changes to existing routes).

## Complexity Tracking

> No constitutional violations. All complexity justified and documented.

**Complexity Notes**:
- JWT verification adds ~30 lines of code (auth.py module)
- Each endpoint updated with single `Depends(get_current_user)` parameter
- Frontend adds ~150 lines for Better Auth setup and auth pages
- Testing complexity increases: auth fixtures + authenticated requests

**Mitigation**:
- Centralized auth logic in dedicated modules
- Reusable dependency injection pattern
- Clear separation: auth verification (backend) vs session management (Better Auth)

## Implementation Phases

### Phase 0: Research ✅ COMPLETE

**Status**: Complete - See [auth-research.md](./auth-research.md)

**Deliverables**:
- ✅ Q1: Better Auth JWT plugin configuration
- ✅ Q2: JWT signing algorithm and secret management
- ✅ Q3: FastAPI JWT verification with dependency injection
- ✅ Q4: User identity matching (JWT sub vs URL user_id)
- ✅ Q5: Token expiry configuration
- ✅ Q6: Frontend token attachment strategy

**Key Findings**:
- Better Auth JWT plugin provides turnkey token issuance
- HS256 symmetric signing with shared `BETTER_AUTH_SECRET`
- FastAPI `HTTPBearer` + `Depends(get_current_user)` pattern
- 24-hour token expiry balances security and UX

---

### Phase 1: Foundation (Backend Auth Infrastructure)

**Goal**: Create JWT verification infrastructure on FastAPI backend

**Prerequisites**: Phase 0 research complete

**Tasks**:
1. Add PyJWT to backend/requirements.txt
2. Add `BETTER_AUTH_SECRET` to backend/.env.example
3. Create backend/app/auth.py module with:
   - `get_current_user()` dependency function
   - JWT decoding with PyJWT
   - Signature verification using BETTER_AUTH_SECRET
   - Token expiry validation
   - User ID extraction from `sub` claim
   - Error handling (401 for invalid/expired, 403 for ownership mismatch)

**Acceptance Criteria**:
- `get_current_user()` dependency extracts user_id from valid JWT
- Invalid tokens raise HTTPException 401
- Expired tokens raise HTTPException 401
- Missing Authorization header raises HTTPException 401
- Dependency returns authenticated user_id (string)

**Files Modified**:
- backend/requirements.txt (add `pyjwt>=2.8.0`)
- backend/.env.example (add `BETTER_AUTH_SECRET=...`)
- backend/app/auth.py (NEW file)

---

### Phase 2: Backend Endpoint Protection

**Goal**: Apply JWT authentication to all existing task endpoints

**Prerequisites**: Phase 1 complete

**Tasks**:
1. Update backend/app/routers/tasks.py:
   - Import `get_current_user` from app.auth
   - Add `authenticated_user: str = Depends(get_current_user)` parameter to all 6 endpoints
   - Add ownership validation: `if authenticated_user != user_id: raise HTTPException(403)`
   - Use `authenticated_user` (from JWT) for database queries instead of URL `user_id`

2. Update existing endpoints:
   - GET /api/{user_id}/tasks
   - POST /api/{user_id}/tasks
   - GET /api/{user_id}/tasks/{id}
   - PUT /api/{user_id}/tasks/{id}
   - DELETE /api/{user_id}/tasks/{id}
   - PATCH /api/{user_id}/tasks/{id}/complete

**Acceptance Criteria**:
- All endpoints require valid JWT in Authorization header
- Requests without JWT return 401
- Requests with valid JWT but wrong user_id return 403
- Database queries use authenticated_user, not URL user_id
- Existing functionality preserved when properly authenticated

**Files Modified**:
- backend/app/routers/tasks.py (add auth dependency to 6 endpoints)

---

### Phase 3: Backend Testing Updates

**Goal**: Update test suite to handle JWT authentication

**Prerequisites**: Phase 2 complete

**Tasks**:
1. Update backend/tests/conftest.py:
   - Add `create_test_jwt(user_id: str)` fixture
   - Generate JWTs signed with test BETTER_AUTH_SECRET
   - Provide helper for creating Authorization headers

2. Update backend/tests/test_tasks.py:
   - Add Authorization headers to all 38 test requests
   - Add new tests for auth scenarios:
     - Test request without Authorization header (401)
     - Test request with invalid JWT (401)
     - Test request with expired JWT (401)
     - Test user1 trying to access user2's tasks (403)
     - Test valid JWT with correct user_id (200/201/204)

**Acceptance Criteria**:
- All existing tests pass with JWT authentication
- New auth tests cover 401/403 error scenarios
- Test fixtures provide easy JWT generation
- Tests verify ownership enforcement

**Files Modified**:
- backend/tests/conftest.py (add JWT fixtures)
- backend/tests/test_tasks.py (update 38 tests + add 6 new auth tests)

---

### Phase 4: Frontend Better Auth Setup

**Goal**: Configure Better Auth with JWT plugin on Next.js frontend

**Prerequisites**: Phase 3 complete (backend ready)

**Tasks**:
1. Initialize Next.js frontend (if not exists)
2. Install Better Auth dependencies:
   - `npm install better-auth`
3. Create frontend/src/lib/auth.ts:
   - Configure Better Auth server with JWT plugin
   - Set `BETTER_AUTH_SECRET` from env
   - Configure database connection for user storage
   - Enable email/password authentication
4. Create Better Auth API route: frontend/src/app/api/auth/[...all]/route.ts
5. Create auth client: frontend/src/lib/auth-client.ts with JWT client plugin

**Acceptance Criteria**:
- Better Auth server initialized with JWT plugin
- JWT plugin issues tokens with `sub` claim
- Auth API routes handle sign-up/sign-in
- Client can retrieve JWT tokens via `authClient.token()`

**Files Created**:
- frontend/src/lib/auth.ts (Better Auth server config)
- frontend/src/lib/auth-client.ts (client config with jwtClient)
- frontend/src/app/api/auth/[...all]/route.ts (API routes)
- frontend/.env.local.example (BETTER_AUTH_SECRET, DATABASE_URL)
- frontend/package.json (Better Auth dependencies)

---

### Phase 5: Frontend Auth UI

**Goal**: Create sign-in/sign-up pages and auth context

**Prerequisites**: Phase 4 complete

**Tasks**:
1. Create sign-up page: frontend/src/app/auth/signup/page.tsx
   - Email/password form
   - Call Better Auth signup method
   - Redirect to tasks page on success
2. Create sign-in page: frontend/src/app/auth/signin/page.tsx
   - Email/password form
   - Call Better Auth signin method
   - Redirect to tasks page on success
3. Create auth provider/context for session management
4. Add protected route wrapper for tasks pages

**Acceptance Criteria**:
- Users can sign up with email/password
- Users can sign in with existing credentials
- Invalid credentials show error message
- Successful auth redirects to tasks page
- Protected routes redirect to sign-in if unauthenticated

**Files Created**:
- frontend/src/app/auth/signup/page.tsx
- frontend/src/app/auth/signin/page.tsx
- frontend/src/components/auth/AuthProvider.tsx (context)
- frontend/src/components/auth/ProtectedRoute.tsx

---

### Phase 6: Frontend API Integration

**Goal**: Attach JWT tokens to all backend API requests

**Prerequisites**: Phase 5 complete

**Tasks**:
1. Create API client utility: frontend/src/lib/api-client.ts
   - Fetch wrapper that retrieves JWT via `authClient.token()`
   - Attaches `Authorization: Bearer <token>` header
   - Handles 401 responses (redirect to sign-in)
   - Handles 403 responses (show error)
2. Create task service: frontend/src/services/tasks.ts
   - getAllTasks(userId)
   - createTask(userId, data)
   - updateTask(userId, taskId, data)
   - deleteTask(userId, taskId)
   - toggleComplete(userId, taskId)
3. Create task list page: frontend/src/app/tasks/page.tsx
   - Fetch user's tasks on load
   - Display task list with completion status
   - Create new task form
   - Toggle completion button
   - Delete task button

**Acceptance Criteria**:
- All API requests include Authorization header with JWT
- Backend accepts requests and returns user's tasks only
- Frontend handles 401 by redirecting to sign-in
- Frontend handles 403 by showing "Access denied" error
- Task CRUD operations work end-to-end

**Files Created**:
- frontend/src/lib/api-client.ts (authenticated fetch wrapper)
- frontend/src/services/tasks.ts (task API methods)
- frontend/src/app/tasks/page.tsx (main task UI)

---

### Phase 7: End-to-End Testing

**Goal**: Validate complete authentication flow

**Prerequisites**: Phase 6 complete

**Tasks**:
1. Manual testing scenarios:
   - User sign-up → JWT issued → can create/view tasks
   - User sign-in → JWT issued → can access existing tasks
   - User1 cannot access User2's tasks (403)
   - Expired token → 401 → redirect to sign-in
   - Missing token → 401 → redirect to sign-in
2. Integration test suite (frontend):
   - Test auth flow with real backend
   - Test task operations with authentication
   - Test error handling (401/403)
3. Performance validation:
   - JWT verification overhead <50ms
   - Token retrieval <100ms
   - No degradation to task operations

**Acceptance Criteria**:
- All user stories pass acceptance scenarios
- Security requirements met (zero cross-user access)
- Performance goals achieved
- Error handling graceful and user-friendly

**Files Modified**:
- backend/README.md (update with auth setup)
- frontend/README.md (create with setup instructions)

---

### Phase 8: Documentation & Deployment

**Goal**: Document authentication setup and prepare for deployment

**Prerequisites**: Phase 7 complete

**Tasks**:
1. Update backend/README.md:
   - Add BETTER_AUTH_SECRET configuration
   - Document JWT verification process
   - Add authenticated curl examples
2. Create frontend/README.md:
   - Setup instructions (env variables)
   - Development server start
   - Auth flow explanation
3. Create auth-quickstart.md:
   - End-to-end setup guide
   - Secret generation instructions
   - Local development workflow
4. Security checklist:
   - BETTER_AUTH_SECRET never committed
   - HTTPS required in production
   - Token expiry enforced
   - CORS properly configured

**Acceptance Criteria**:
- All documentation updated
- Setup instructions tested end-to-end
- Security checklist complete
- Deployment-ready

**Files Modified**:
- backend/README.md (auth section added)
- frontend/README.md (created)
- specs/002-web-app/auth-quickstart.md (created)

---

## Data Model Changes

**No changes to existing Task model**. The `user_id` field remains a string (compatible with JWT `sub` claim).

**Better Auth manages user data separately**:
- User table (email, password hash, etc.) managed by Better Auth
- Session table managed by Better Auth
- Backend never queries user data directly
- Backend only validates JWT signature and extracts `sub` claim

**JWT Token Structure**:
```json
{
  "sub": "user-id-string",
  "email": "user@example.com",
  "iat": 1704067200,
  "exp": 1704153600
}
```

## API Contract Changes

**Existing endpoints unchanged** - all 6 task endpoints keep same URL structure:
- GET /api/{user_id}/tasks
- POST /api/{user_id}/tasks
- GET /api/{user_id}/tasks/{id}
- PUT /api/{user_id}/tasks/{id}
- DELETE /api/{user_id}/tasks/{id}
- PATCH /api/{user_id}/tasks/{id}/complete

**New behavior**: All endpoints now require `Authorization: Bearer <token>` header.

**Error responses updated**:
- 401 Unauthorized: Missing/invalid/expired JWT
- 403 Forbidden: Valid JWT but user_id mismatch

**No new API endpoints needed** - Better Auth provides auth endpoints at `/api/auth/*`

## Security Considerations

### Threat Model
- **Token Tampering**: Mitigated by HMAC signature verification
- **Token Theft**: Mitigated by short expiry (24 hours)
- **Cross-User Access**: Mitigated by ownership validation (JWT sub vs URL user_id)
- **Replay Attacks**: Partially mitigated by expiry; full mitigation requires nonces (out of scope)
- **Secret Exposure**: Mitigated by environment variables (never committed)

### Security Controls
1. **Cryptographic Verification**: PyJWT validates HMAC signature
2. **Expiry Enforcement**: Backend rejects tokens past `exp` claim
3. **Ownership Validation**: Backend compares JWT `sub` with URL `user_id`
4. **Stateless Design**: No backend session storage (no session hijacking)
5. **HTTPS Required**: Tokens transmitted securely in production

### Out of Scope
- Refresh token rotation (would improve security but excluded per spec)
- Token revocation/blacklist (stateless requirement prevents this)
- Rate limiting (can be added as separate feature)
- IP allowlisting (not required for MVP)

## Testing Strategy

### Backend Tests
- **Unit Tests**: JWT verification logic (auth.py)
- **Integration Tests**: Authenticated endpoints (test_tasks.py updated)
- **Security Tests**: 401/403 scenarios, token tampering, expiry

### Frontend Tests
- **Component Tests**: Auth forms (sign-up/sign-in)
- **Integration Tests**: Auth flow + task operations
- **E2E Tests**: Complete user journey (sign-up → tasks → sign-out)

### Test Coverage Goals
- Backend auth module: 100% (critical security code)
- Backend endpoints: 95% (existing coverage maintained)
- Frontend auth components: 85%
- Overall: 90%+

## Deployment Checklist

- [ ] Generate strong BETTER_AUTH_SECRET (minimum 32 chars)
- [ ] Configure BETTER_AUTH_SECRET on frontend (env variable)
- [ ] Configure BETTER_AUTH_SECRET on backend (env variable)
- [ ] Verify backend DATABASE_URL (Neon PostgreSQL)
- [ ] Configure Better Auth database (user/session tables)
- [ ] Run Better Auth migrations
- [ ] Enable HTTPS on both frontend and backend
- [ ] Configure CORS to allow frontend origin
- [ ] Test end-to-end auth flow in staging
- [ ] Verify token expiry enforcement
- [ ] Monitor JWT verification performance (<50ms)

## Success Metrics

From [auth-spec.md](./auth-spec.md):

- **SC-001**: All API endpoints reject unauthenticated requests (0% success rate without JWT)
- **SC-002**: 100% data isolation (zero cross-user data leakage in tests)
- **SC-003**: Token expiry enforced within 1 second of expiration
- **SC-004**: Stateless architecture confirmed (no backend session database)
- **SC-005**: JWT verification <50ms overhead per request
- **SC-006**: 100% of task operations require authentication
- **SC-007**: Sign-up to task access within 30 seconds

## Known Limitations

1. **No Refresh Tokens**: Users must re-authenticate after 24-hour expiry (UX trade-off per spec)
2. **No Token Revocation**: Stateless design prevents blacklisting compromised tokens
3. **Single Factor Only**: Email/password only (MFA out of scope)
4. **No Social Login**: Email/password only (social providers excluded per spec)
5. **No Password Reset**: Users must contact support (feature excluded per spec)

## Future Enhancements (Out of Scope)

- Refresh token flow for seamless re-authentication
- Role-based access control (admin vs user)
- Multi-factor authentication (TOTP, SMS)
- Social login providers (Google, GitHub)
- Password reset via email
- Account deletion
- Session management dashboard
- Token usage analytics

## References

- [auth-spec.md](./auth-spec.md) - Feature specification
- [auth-research.md](./auth-research.md) - Technical research findings
- Better Auth Documentation: https://www.better-auth.com
- FastAPI Security: https://fastapi.tiangolo.com/tutorial/security/
- JWT RFC 7519: https://tools.ietf.org/html/rfc7519
- OAuth 2.0 Bearer Tokens RFC 6750: https://tools.ietf.org/html/rfc6750
