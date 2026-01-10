---
name: auth-skill
description: Design and implement secure authentication systems across Next.js and FastAPI using JWT and best practices.
---

# Auth Agent Skill

## Instructions

1. **Authentication Architecture**
   - Stateless JWT-based authentication
   - Separation of auth concerns (issuer vs consumer)
   - Support frontend (Next.js) and backend (FastAPI)

2. **Better Auth (Next.js)**
   - Configure authentication providers
   - Secure session handling
   - Token storage best practices (HTTP-only cookies)
   - Route protection and middleware guards

3. **JWT Signing & Verification**
   - Strong signing algorithms (HS256 / RS256)
   - Secure key management
   - Token claims (sub, exp, iat, aud)
   - Refresh vs access token strategy

4. **FastAPI Auth Guards**
   - Dependency-based authentication
   - Middleware for global protection
   - Role- and scope-based access control
   - Proper error handling (401 vs 403)

5. **Security Best Practices**
   - Token expiry and rotation
   - Header validation (Authorization: Bearer)
   - CSRF considerations
   - Prevent token leakage and replay attacks

## Best Practices
- Keep access tokens short-lived
- Always validate token signature and expiry
- Use HTTPS only
- Prefer HTTP-only cookies over localStorage
- Fail closed (deny by default)


