# Research: JWT Authentication Integration

**Feature**: 002-web-app (Authentication Enhancement)
**Created**: 2026-01-08
**Research Phase**: Phase 0

## Research Questions & Findings

### Q1: How to configure Better Auth with JWT plugin in Next.js App Router?

**Decision**: Use Better Auth JWT plugin with default configuration

**Findings**:
- Better Auth provides a dedicated JWT plugin (`better-auth/plugins`) that must be initialized in the server configuration
- Plugin enables JWT token generation and automatic JWKS endpoints for token verification
- Requires database migration after adding plugin to create necessary fields
- Default JWKS endpoint is `/jwks`, can be customized to `/.well-known/jwks.json` for OAuth 2.0 conventions

**Configuration**:
```typescript
import { betterAuth } from "better-auth"
import { jwt } from "better-auth/plugins"

export const auth = betterAuth({
    plugins: [jwt()]
})
```

**Client-side token retrieval**:
```typescript
import { createAuthClient } from "better-auth/client"
import { jwtClient } from "better-auth/client/plugins"

export const authClient = createAuthClient({
  plugins: [jwtClient()]
})

// Retrieve token
const { data, error } = await authClient.token()
const jwtToken = data.token // Use in Authorization: Bearer header
```

**Rationale**: Better Auth JWT plugin provides turnkey JWT issuance with minimal configuration, automatic JWKS endpoints, and built-in session integration. This approach is simpler than implementing custom JWT generation.

**Alternatives Considered**:
- Custom JWT generation with `jose` library - Rejected: More complex, requires manual session integration
- NextAuth.js with JWT strategy - Rejected: Specification mandates Better Auth

**Source**: Context7 - Better Auth documentation (/www.better-auth.com/llmstxt)

---

### Q2: What JWT signing algorithm and secret management approach should be used?

**Decision**: HS256 (HMAC SHA-256) symmetric signing with shared secret

**Findings**:
- HS256 uses symmetric key (same secret for signing and verification)
- Shared secret (`BETTER_AUTH_SECRET`) must be stored in environment variables on both frontend and backend
- Secret must be minimum 32 characters for security
- Alternative algorithms available: ES256 (asymmetric), RS256 (asymmetric with public/private keys)

**Configuration**:
- Frontend (Next.js): `BETTER_AUTH_SECRET` env variable
- Backend (FastAPI): Same `BETTER_AUTH_SECRET` env variable
- Algorithm: `HS256` (default for Better Auth)

**Rationale**: HS256 is simpler for stateless architecture with single backend. Both services share the same secret, enabling backend to verify tokens signed by Better Auth without requiring public key infrastructure or JWKS endpoint queries.

**Alternatives Considered**:
- ES256/RS256 asymmetric signing - Rejected: Adds complexity of key management; unnecessary for single-backend architecture
- Backend queries Better Auth JWKS endpoint - Rejected: Adds network dependency and latency; violates stateless requirement

**Security Considerations**:
- Secret must never be committed to git (use .env files)
- Rotate secret periodically (invalidates all existing tokens)
- Backend must validate token expiry (`exp` claim)

**Source**: FastAPI JWT documentation, JWT RFC 7519 standards

---

### Q3: How to implement JWT verification in FastAPI with dependency injection?

**Decision**: Use FastAPI `Depends()` with custom `get_current_user` dependency

**Findings**:
- FastAPI provides `OAuth2PasswordBearer` or `HTTPBearer` for extracting tokens from `Authorization: Bearer <token>` header
- `PyJWT` library (recommended) or `python-jose` for token decoding and signature verification
- Dependency injection pattern allows reusable auth logic across all endpoints
- Token verification includes: signature validation, expiry check, claims extraction

**Implementation Pattern**:
```python
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer
import jwt

security = HTTPBearer()

async def get_current_user(credentials: HTTPAuthCredentials = Depends(security)):
    token = credentials.credentials
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
        user_id = payload.get("sub")  # Subject claim contains user identifier
        if user_id is None:
            raise HTTPException(status_code=401, detail="Invalid token")
        return user_id
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

# Use in endpoint
@app.get("/api/{user_id}/tasks")
async def get_tasks(user_id: str, authenticated_user: str = Depends(get_current_user)):
    if authenticated_user != user_id:
        raise HTTPException(status_code=403, detail="Access forbidden")
    # Proceed with query
```

**Rationale**: Dependency injection is explicit, testable, and follows FastAPI best practices. Each endpoint explicitly declares authentication requirement. Easier to debug than middleware approach.

**Alternatives Considered**:
- Global middleware for all routes - Rejected: Less explicit, harder to exclude specific routes, more difficult to test
- Manual token parsing in each route - Rejected: Code duplication, violates DRY principle

**Error Handling**:
- 401 Unauthorized: Missing token, invalid signature, expired token, malformed token
- 403 Forbidden: Valid token but user_id mismatch (user trying to access another user's resources)

**Source**: Context7 - FastAPI Security documentation (/websites/fastapi_tiangolo)

---

### Q4: How to match authenticated user with URL user_id parameter?

**Decision**: Extract user_id from JWT `sub` claim and validate against URL path parameter

**Findings**:
- JWT standard uses `sub` (subject) claim for user identifier
- Better Auth JWT plugin includes user identity in token payload
- Backend must compare `token.sub` with `path_parameter.user_id`
- Mismatch results in 403 Forbidden (authenticated but not authorized)

**Validation Logic**:
```python
async def get_current_user(credentials: HTTPAuthCredentials = Depends(security)):
    # ... token verification ...
    return payload.get("sub")  # Returns user_id from token

@app.get("/api/{user_id}/tasks")
async def get_tasks(
    user_id: str,  # From URL path
    authenticated_user: str = Depends(get_current_user)  # From JWT
):
    # Ownership check
    if authenticated_user != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Cannot access resources for user {user_id}"
        )
    # Use authenticated_user for database query (NOT user_id)
    tasks = session.exec(select(Task).where(Task.user_id == authenticated_user)).all()
```

**Rationale**: Preserves existing API structure (`/api/{user_id}/tasks`) while adding security layer. Client can still construct URLs naturally, but backend enforces ownership through JWT verification.

**Security Enhancement**:
- Old approach: Trusted client-supplied `user_id` in URL (insecure)
- New approach: URL `user_id` is validated against cryptographically verified JWT claim
- Database queries use `authenticated_user` from token, not URL parameter

**Alternatives Considered**:
- Remove user_id from URL, use only token - Rejected: Breaks existing API contract, requires frontend URL changes
- Trust URL user_id after token verification - Rejected: Defeats purpose of authentication; must always verify ownership

**Source**: JWT RFC 7519 (sub claim), Better Auth JWT plugin documentation

---

### Q5: What JWT token expiry configuration should be used?

**Decision**: 24-hour token expiry (configurable via Better Auth)

**Findings**:
- Better Auth JWT plugin supports custom expiry via configuration
- Standard practice: Access tokens 15min-24hrs, refresh tokens 7-30 days
- Specification excludes refresh token flow (out of scope)
- Longer expiry reduces re-authentication friction but increases security window

**Configuration**:
```typescript
jwt({
  expirationTime: 60 * 60 * 24  // 24 hours in seconds
})
```

**Rationale**: 24-hour expiry balances security (limits exposure window) with user experience (single daily login). Without refresh tokens, shorter expiry would require frequent re-authentication.

**Expiry Enforcement**:
- Better Auth automatically adds `exp` claim to JWT
- Backend verifies expiry during token decoding
- PyJWT raises `ExpiredSignatureError` for expired tokens
- Frontend receives 401, should redirect to sign-in

**Alternatives Considered**:
- 7-day expiry - Rejected: Too long without refresh token mechanism
- 1-hour expiry - Rejected: Excessive re-authentication burden without refresh flow
- No expiry - Rejected: Security risk; tokens valid forever

**Source**: JWT best practices, Better Auth JWT plugin documentation

---

### Q6: How should frontend attach JWT to API requests?

**Decision**: Use `Authorization: Bearer <token>` header for all API requests

**Findings**:
- Standard OAuth 2.0 Bearer token authentication scheme
- Better Auth jwtClient plugin returns token suitable for Authorization header
- Backend HTTPBearer extracts token automatically
- Token never exposed in URL query parameters (prevents log leakage)

**Frontend Implementation Pattern**:
```typescript
// Retrieve token
const { data } = await authClient.token()

// Attach to API requests
const response = await fetch('http://backend/api/user123/tasks', {
  headers: {
    'Authorization': `Bearer ${data.token}`
  }
})
```

**Rationale**: Authorization header is the industry standard for JWT transmission. Keeps tokens out of URLs (which are logged), supports CORS properly, and works with FastAPI HTTPBearer extraction.

**Alternatives Considered**:
- Cookie-based transmission - Rejected: Better Auth uses session cookies separately; mixing strategies adds complexity
- Query parameter (?token=...) - Rejected: Tokens logged in server access logs; security risk
- Custom header (X-Auth-Token) - Rejected: Non-standard; breaks compatibility with tools

**Security Notes**:
- HTTPS required in production (token transmitted in cleartext otherwise)
- Token should be stored securely on frontend (httpOnly cookie preferred, session storage acceptable)
- Never log Authorization headers

**Source**: OAuth 2.0 Bearer Token RFC 6750, Better Auth client documentation

---

## Research Summary

### Key Decisions
1. **Better Auth JWT Plugin**: Use official JWT plugin with default HS256 signing
2. **Shared Secret**: `BETTER_AUTH_SECRET` environment variable on both services
3. **FastAPI Dependency Injection**: `get_current_user` dependency with HTTPBearer
4. **Ownership Validation**: Compare JWT `sub` claim with URL `user_id` parameter
5. **Token Expiry**: 24-hour lifetime (configurable)
6. **Token Transmission**: `Authorization: Bearer <token>` header

### Dependencies Identified
- **Frontend**: Better Auth, better-auth/plugins (JWT), better-auth/client/plugins (jwtClient)
- **Backend**: PyJWT (for token verification), FastAPI security utilities (HTTPBearer)
- **Shared**: BETTER_AUTH_SECRET environment variable (minimum 32 characters)

### Integration Points
- Better Auth issues JWT with `sub` claim containing user_id
- Frontend retrieves token via `authClient.token()` and attaches to API requests
- Backend extracts token from Authorization header, verifies signature, validates expiry
- Backend compares JWT user_id with URL user_id (403 if mismatch)
- Database queries use authenticated user_id from JWT (ignore URL parameter)

### Security Guarantees
- Stateless authentication (no backend session storage)
- Cryptographic signature verification prevents token tampering
- Expiry enforcement limits token lifetime
- Ownership validation prevents cross-user access
- Zero trust in client-supplied identifiers

### Open Questions
None. All technical unknowns resolved through Context7 research.

### Next Phase
Proceed to Phase 1 (Design & Contracts) to create data models, API contracts, and implementation quickstart guide.
