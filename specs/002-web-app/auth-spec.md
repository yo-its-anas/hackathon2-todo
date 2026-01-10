# Feature Specification: Authentication Integration & Secure User Isolation

**Feature Branch**: `002-web-app`
**Created**: 2026-01-08
**Status**: Draft
**Input**: User description: "Authentication, Authorization & Secure API Access - Introduce secure, stateless authentication into the Todo Full-Stack Web Application by integrating Better Auth (Next.js) with a FastAPI backend using JWT-based verification"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - User Registration and Sign In (Priority: P1)

A new user visits the application and needs to create an account to start using the todo app. They provide their email and password, receive a secure JWT token, and gain access to their personal todo workspace.

**Why this priority**: Core authentication flow is the foundation for all security features. Without user registration and sign-in, no other authenticated features can function.

**Independent Test**: Can be fully tested by signing up with an email/password, receiving a JWT token, and verifying the token is valid and contains the correct user identity. Delivers a secure, authenticated session.

**Acceptance Scenarios**:

1. **Given** no existing account, **When** user signs up with valid email and password, **Then** Better Auth creates account, issues JWT token, and user can access protected resources
2. **Given** existing account, **When** user signs in with correct credentials, **Then** Better Auth issues JWT token with user identity (user_id, email)
3. **Given** existing account, **When** user signs in with incorrect password, **Then** sign-in fails and no token is issued
4. **Given** user has valid JWT token, **When** token is presented to backend API, **Then** backend verifies signature and extracts user identity

---

### User Story 2 - Authenticated Task Operations (Priority: P1)

An authenticated user wants to view, create, and manage their tasks. Every API request must include their JWT token, and the backend must verify the token and ensure they only access their own data.

**Why this priority**: This is the core value proposition - secure, user-scoped task management. Without this, the authentication system provides no practical benefit.

**Independent Test**: Can be fully tested by authenticating as user1, creating tasks, and verifying user2 cannot access user1's tasks even with a valid token. Delivers complete data isolation.

**Acceptance Scenarios**:

1. **Given** authenticated user with valid JWT, **When** user requests their tasks via GET /api/{user_id}/tasks, **Then** backend verifies token, confirms token user_id matches URL user_id, and returns only their tasks
2. **Given** authenticated user with valid JWT, **When** user creates task via POST /api/{user_id}/tasks, **Then** backend verifies token, confirms ownership, and creates task associated with authenticated user
3. **Given** authenticated user1 with valid JWT, **When** user1 tries to access user2's tasks, **Then** backend returns 403 Forbidden because token user_id ≠ URL user_id
4. **Given** unauthenticated request (no JWT), **When** user tries to access any task endpoint, **Then** backend returns 401 Unauthorized

---

### User Story 3 - Token Expiry and Session Management (Priority: P2)

An authenticated user's JWT token expires after a defined period. The frontend must detect token expiry, prevent API calls with expired tokens, and prompt the user to re-authenticate.

**Why this priority**: Essential for security (limits token lifetime) but not blocking initial authentication flow. Can be implemented after basic auth works.

**Independent Test**: Can be fully tested by creating a JWT with short expiry (e.g., 1 minute), waiting for expiry, attempting API call, and verifying 401 response. Delivers time-bound security.

**Acceptance Scenarios**:

1. **Given** user has JWT token with expiry timestamp, **When** current time exceeds expiry, **Then** backend rejects token with 401 Unauthorized
2. **Given** user's token is expired, **When** frontend attempts API call, **Then** frontend detects expiry, prevents call, and redirects user to sign-in
3. **Given** user has valid unexpired JWT, **When** user makes API request, **Then** request proceeds normally without re-authentication

---

### User Story 4 - Secure Token Storage and Transmission (Priority: P2)

The frontend must securely store JWT tokens and attach them to all API requests. Tokens must never be exposed in URLs or logged, and must be transmitted via Authorization header.

**Why this priority**: Security best practice that prevents token leakage, but can be refined after basic auth flow works. Initial implementation can use simpler storage.

**Independent Test**: Can be fully tested by inspecting network traffic, verifying Authorization: Bearer <token> header is present, and confirming tokens are not in query parameters or localStorage (without additional protection).

**Acceptance Scenarios**:

1. **Given** user signs in successfully, **When** Better Auth issues JWT, **Then** frontend stores token securely (httpOnly cookie or secure session storage)
2. **Given** user has stored JWT, **When** frontend makes API request, **Then** frontend attaches token as "Authorization: Bearer <token>" header
3. **Given** user has stored JWT, **When** inspecting browser storage, **Then** token is not visible in plain localStorage or URL parameters

---

### Edge Cases

- **Token tampering**: What happens when user modifies JWT token payload? Backend must reject with 401 (signature verification fails)
- **Missing Authorization header**: What happens when API request has no Authorization header? Backend must return 401 Unauthorized
- **Malformed JWT**: What happens when Authorization header contains invalid JWT format? Backend must return 401 with clear error message
- **Token issued before user deletion**: What happens when JWT is valid but user account was deleted? Backend should return 401 or 403 (user no longer exists)
- **Concurrent sessions**: What happens when user signs in from multiple devices? All devices get independent JWTs, all are valid until expiry
- **CORS preflight**: What happens when browser sends OPTIONS request before authenticated POST? Backend CORS middleware must allow without requiring JWT

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST use Better Auth library for user authentication on the Next.js frontend
- **FR-002**: Better Auth MUST issue JWT tokens signed with BETTER_AUTH_SECRET environment variable
- **FR-003**: JWT tokens MUST contain user identity claims (user_id, email) in the payload
- **FR-004**: JWT tokens MUST include expiry timestamp (exp claim) enforced by backend
- **FR-005**: Frontend MUST attach JWT token to every API request via "Authorization: Bearer <token>" header
- **FR-006**: Backend MUST verify JWT signature using shared BETTER_AUTH_SECRET before processing any request
- **FR-007**: Backend MUST extract user_id from verified JWT and use it for all database queries (replacing user_id path parameter trust)
- **FR-008**: Backend MUST return 401 Unauthorized when JWT is missing, invalid, expired, or has invalid signature
- **FR-009**: Backend MUST return 403 Forbidden when JWT is valid but token user_id does not match requested resource owner
- **FR-010**: Backend MUST NOT trust client-supplied user_id in URL path without verifying JWT contains matching user_id
- **FR-011**: System MUST operate statelessly - no backend session storage, no shared database for sessions
- **FR-012**: JWT secret (BETTER_AUTH_SECRET) MUST be stored in environment variables on both frontend and backend
- **FR-013**: Frontend MUST prevent unauthenticated users from accessing protected pages (redirect to sign-in)
- **FR-014**: Frontend MUST handle token expiry gracefully by redirecting to sign-in when 401 received
- **FR-015**: All existing API endpoints (/api/{user_id}/tasks*) MUST require valid JWT authentication

### Key Entities

- **User Session (JWT Token)**: Represents an authenticated user session as a cryptographically signed token containing user_id, email, and expiry timestamp. Token is self-contained (no backend lookup required).
- **Authenticated User**: User identity extracted from verified JWT, used to scope all database queries and enforce ownership checks.
- **Environment Secret (BETTER_AUTH_SECRET)**: Shared secret key used by frontend (Better Auth) to sign JWTs and by backend (FastAPI) to verify signatures.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: All API endpoints reject requests without valid JWT tokens (0% success rate for unauthenticated requests)
- **SC-002**: Authenticated users can only access their own tasks (100% data isolation - zero cross-user data leakage in tests)
- **SC-003**: Token expiry is enforced within 1 second of expiration time (backend rejects expired tokens immediately)
- **SC-004**: Frontend and backend communicate with zero shared state (stateless architecture - backend has no session database)
- **SC-005**: JWT verification adds less than 50ms overhead per request (minimal performance impact)
- **SC-006**: 100% of task operations require authentication (no endpoints bypass JWT verification)
- **SC-007**: Users can complete sign-up and access tasks within 30 seconds (smooth onboarding experience)

## Dependencies & Assumptions

### Dependencies

- Existing Backend REST API (specs/002-web-app/spec.md) must be implemented
- Better Auth library must be compatible with Next.js App Router
- PyJWT or python-jose library for FastAPI JWT verification

### Assumptions

- **Token Storage**: Frontend will use Better Auth's default secure token storage mechanism (httpOnly cookies preferred)
- **Token Expiry**: Default token expiry will be 24 hours (configurable via Better Auth)
- **User Model**: Better Auth will manage user accounts (email/password) separate from backend database
- **CORS Configuration**: Existing CORS middleware in backend/app/main.py already allows Authorization headers
- **Signature Algorithm**: JWTs will use HS256 (HMAC SHA-256) symmetric signing
- **User Identifier**: Better Auth user_id will be a string (UUID or similar) matching the user_id field in Task model

## Constraints

- **MUST use Better Auth**: No alternative authentication libraries allowed (requirement from specification)
- **JWT verification only**: No OAuth2 token introspection or external auth provider verification
- **No role-based access control**: Single user role (all users have same permissions on their own data)
- **Stateless only**: No backend session storage, no Redis, no shared database for tokens
- **Agent-generated code only**: All implementation must be generated by AI agents following spec-driven workflow

## Out of Scope

The following are explicitly NOT included in this specification:

- **Refresh token rotation**: Tokens are valid until expiry, no refresh token flow
- **Role-based permissions**: No admin/user roles, no fine-grained permissions
- **Admin dashboards**: No admin interface for user management
- **Social login providers**: No OAuth (Google, GitHub, etc.), email/password only
- **Password reset flow**: No forgot password / reset password functionality
- **Email verification**: No email confirmation requirement for new accounts
- **Multi-factor authentication (MFA)**: No 2FA, TOTP, SMS verification
- **Account deletion**: No user-initiated account deletion
- **Frontend UI polish**: Focus on functional authentication, not visual design
- **Token revocation**: No blacklist mechanism for invalidating tokens before expiry
- **Rate limiting**: No request throttling or brute-force protection (can be added later)
