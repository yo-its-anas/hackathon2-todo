# JWT Authentication Quick Start Guide

**Feature**: 002-web-app (Authentication Enhancement)
**Created**: 2026-01-08
**Related**: [auth-spec.md](./auth-spec.md) | [auth-plan.md](./auth-plan.md) | [auth-tasks.md](./auth-tasks.md)

## Overview

This guide walks you through setting up JWT authentication with Better Auth (frontend) and FastAPI (backend) for the Todo application.

## Prerequisites

- Python 3.13+
- Node.js 18+ / npm
- Neon PostgreSQL database
- Terminal access

## Step-by-Step Setup

### 1. Generate Shared Secret

Both frontend and backend must use the **same secret** for JWT signing and verification.

```bash
# Generate a secure 32+ character secret
openssl rand -base64 32
```

**Example output**:
```
h8Xk2pQ9mN4vL7wR3tY6uI8oP0aS1dF5gH7jK9lZ2xC4vB6nM8
```

⚠️ **Security**: Never commit this secret to git. Store it in `.env` files only.

### 2. Backend (FastAPI) Setup

#### 2.1 Install Dependencies

```bash
cd backend
pip install -r requirements.txt
```

This installs:
- `PyJWT>=2.8.0` - JWT token verification
- FastAPI, SQLModel, Uvicorn, etc.

#### 2.2 Configure Environment

```bash
# Create .env file from example
cp .env.example .env

# Edit .env and add the shared secret
nano .env
```

Required variables:
```bash
DATABASE_URL=postgresql://user:pass@host-pooler.region.aws.neon.tech/db?sslmode=require
BETTER_AUTH_SECRET=<paste-your-generated-secret-here>
```

#### 2.3 Start Backend Server

```bash
uvicorn app.main:app --reload
```

Backend will run at: `http://localhost:8000`

**Verify**:
- API docs: http://localhost:8000/docs
- Health check: http://localhost:8000/

### 3. Frontend (Next.js) Setup

#### 3.1 Install Dependencies

```bash
cd frontend
npm install
```

This installs:
- `next` - Next.js framework
- `react`, `react-dom` - React libraries
- `better-auth` - Authentication library with JWT plugin

#### 3.2 Configure Environment

```bash
# Create .env.local file from example
cp .env.local.example .env.local

# Edit .env.local and add the SAME secret as backend
nano .env.local
```

Required variables:
```bash
# MUST match backend BETTER_AUTH_SECRET
BETTER_AUTH_SECRET=<paste-same-secret-as-backend>

# Database for Better Auth user storage (can use same Neon database)
DATABASE_URL=postgresql://user:pass@host-pooler.region.aws.neon.tech/db?sslmode=require

# Better Auth API URL
BETTER_AUTH_URL=http://localhost:3000
NEXT_PUBLIC_BETTER_AUTH_URL=http://localhost:3000

# Backend API URL for task operations
NEXT_PUBLIC_API_URL=http://localhost:8000
```

#### 3.3 Start Frontend Server

```bash
npm run dev
```

Frontend will run at: `http://localhost:3000`

**Available pages**:
- Home: http://localhost:3000/
- Sign up: http://localhost:3000/auth/signup
- Sign in: http://localhost:3000/auth/signin
- Tasks: http://localhost:3000/tasks (requires authentication)

## Testing the Authentication Flow

### 1. Sign Up New User

1. Navigate to http://localhost:3000/auth/signup
2. Enter:
   - Name: `Test User`
   - Email: `test@example.com`
   - Password: `password123` (min 8 chars)
3. Click "Sign Up"
4. You'll be redirected to `/tasks` with a JWT token

### 2. View Tasks (Authenticated)

Once signed in, the tasks page:
- Retrieves JWT from Better Auth session
- Attaches `Authorization: Bearer <token>` to all API requests
- Backend verifies signature and extracts `user_id` from token
- Only shows tasks belonging to authenticated user

### 3. Sign Out and Sign In

1. Sign out (via Better Auth client method)
2. Navigate to http://localhost:3000/auth/signin
3. Enter credentials
4. JWT token issued and stored in session
5. Redirect to `/tasks`

### 4. Test Cross-User Isolation

1. Open two browser sessions (normal + incognito)
2. Sign up as `user1@example.com` in normal browser
3. Sign up as `user2@example.com` in incognito
4. Create tasks as user1
5. Switch to user2 → tasks list is empty ✓
6. Try to access user1's task URL → 403 Forbidden ✓

## Authentication Flow Diagram

```
┌──────────┐                 ┌─────────────┐                ┌──────────┐
│ Frontend │                 │ Better Auth │                │ Backend  │
│ (Next.js)│                 │   Server    │                │ (FastAPI)│
└────┬─────┘                 └──────┬──────┘                └────┬─────┘
     │                              │                            │
     │ 1. Sign Up/Sign In           │                            │
     │────────────────────────────>│                            │
     │                              │                            │
     │ 2. JWT Token (signed)        │                            │
     │<────────────────────────────│                            │
     │                              │                            │
     │ 3. GET /api/user1/tasks      │                            │
     │    Authorization: Bearer <token>                          │
     │───────────────────────────────────────────────────────>│
     │                              │                            │
     │                              │    4. Verify signature     │
     │                              │        with BETTER_AUTH_SECRET
     │                              │                            │
     │                              │    5. Extract user_id      │
     │                              │        from 'sub' claim    │
     │                              │                            │
     │                              │    6. Validate ownership   │
     │                              │        (user_id == url)    │
     │                              │                            │
     │ 7. Tasks (200 OK) or 403     │                            │
     │<───────────────────────────────────────────────────────│
     │                              │                            │
```

## Security Architecture

### Stateless JWT Verification

- **No Backend Sessions**: Backend doesn't store session data
- **Cryptographic Signatures**: HS256 algorithm with shared secret
- **Token Self-Contained**: All claims in JWT (no database lookups)
- **Expiry Enforcement**: Tokens expire after 24 hours

### Zero Trust Model

Backend **never trusts** client-supplied identifiers:

```python
# ❌ WRONG - trusts URL parameter
tasks = db.query(Task).where(Task.user_id == user_id)

# ✓ CORRECT - uses authenticated user from JWT
tasks = db.query(Task).where(Task.user_id == authenticated_user)
```

### Ownership Validation

Every endpoint compares:
- **JWT user_id** (from `sub` claim, cryptographically verified)
- **URL user_id** (from path parameter, untrusted)

Mismatch → `403 Forbidden`

## Common Issues & Troubleshooting

### Issue: 401 Unauthorized (Missing token)

**Symptom**: All API requests return 401
**Cause**: JWT not being sent to backend
**Fix**: Verify `authenticatedFetch` in `lib/api-client.ts` attaches `Authorization` header

### Issue: 401 Unauthorized (Invalid signature)

**Symptom**: Token sent but backend rejects it
**Cause**: Different secrets on frontend vs backend
**Fix**: Ensure `BETTER_AUTH_SECRET` is **exactly the same** in both `.env` files

### Issue: 403 Forbidden (Cross-user access)

**Symptom**: User can't access their own tasks
**Cause**: JWT `sub` claim doesn't match URL `user_id`
**Fix**: Ensure frontend uses authenticated user's ID in URL construction

### Issue: Token expired

**Symptom**: 401 error after 24 hours
**Cause**: JWT token expired (configured for 24-hour lifetime)
**Fix**: Sign in again to get new token. Future: implement refresh tokens.

## Testing with curl

### 1. Get JWT Token

First, sign in via frontend and extract JWT from Better Auth session, or create a test token:

```python
import jwt
from datetime import datetime, timedelta

secret = "your-better-auth-secret"
payload = {
    "sub": "user123",  # user_id
    "exp": datetime.utcnow() + timedelta(hours=24)
}
token = jwt.encode(payload, secret, algorithm="HS256")
print(token)
```

### 2. Make Authenticated Request

```bash
# Set token
TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

# Get all tasks
curl -H "Authorization: Bearer $TOKEN" \\
     http://localhost:8000/api/user123/tasks

# Create task
curl -X POST \\
     -H "Authorization: Bearer $TOKEN" \\
     -H "Content-Type: application/json" \\
     -d '{"title": "Test Task", "description": "From curl"}' \\
     http://localhost:8000/api/user123/tasks
```

## Running Tests

### Backend Tests

```bash
cd backend

# Run all tests (including auth tests)
pytest

# Run only auth tests
pytest tests/test_auth.py

# Run with verbose output
pytest -v tests/test_tasks_auth.py
```

**Test coverage**:
- JWT verification with valid token
- Expired token handling (401)
- Invalid signature handling (401)
- Missing token handling (401)
- Cross-user access prevention (403)
- All 38 existing tests updated with authentication

## Production Deployment Checklist

Before deploying to production:

- [ ] Generate strong `BETTER_AUTH_SECRET` (min 32 chars, use `openssl rand -base64 32`)
- [ ] Store secret in secure environment variables (never commit to git)
- [ ] Use HTTPS for both frontend and backend (tokens transmitted in cleartext over HTTP)
- [ ] Set production `DATABASE_URL` (Neon production database)
- [ ] Configure CORS origins in `backend/app/main.py` (remove `allow_origins=["*"]`)
- [ ] Set `BETTER_AUTH_URL` and `NEXT_PUBLIC_API_URL` to production URLs
- [ ] Test token expiry flow (24 hours)
- [ ] Monitor 401/403 error rates
- [ ] Rotate `BETTER_AUTH_SECRET` periodically (invalidates all tokens)

## Architecture Reference

**JWT Token Structure**:
```json
{
  "sub": "user_abc123",        // User ID (used for ownership validation)
  "exp": 1704844800,            // Expiry timestamp
  "iat": 1704758400             // Issued at timestamp
}
```

**Signature**: `HMACSHA256(base64UrlEncode(header) + "." + base64UrlEncode(payload), BETTER_AUTH_SECRET)`

**Token Transmission**: `Authorization: Bearer <token>` (OAuth 2.0 standard)

## Additional Resources

- [Better Auth Documentation](https://www.better-auth.com)
- [FastAPI Security](https://fastapi.tiangolo.com/tutorial/security/)
- [JWT RFC 7519](https://datatracker.ietf.org/doc/html/rfc7519)
- [OAuth 2.0 Bearer Tokens RFC 6750](https://datatracker.ietf.org/doc/html/rfc6750)

## Support

For issues or questions:
1. Check [auth-spec.md](./auth-spec.md) for functional requirements
2. Review [auth-plan.md](./auth-plan.md) for architecture decisions
3. Inspect [auth-tasks.md](./auth-tasks.md) for implementation details
4. Check backend logs: `uvicorn app.main:app --reload --log-level debug`
5. Check frontend console: Browser DevTools → Console
