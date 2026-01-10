---
id: "0011"
title: Better Auth JWKS Schema Fix
stage: misc
date: 2026-01-09
surface: agent
model: claude-opus-4-5-20251101
feature: 002-web-app
branch: 002-web-app
user: anaslinux
command: direct-prompt
labels: ["better-auth", "database", "schema", "jwt", "jwks", "bugfix"]
links:
  spec: specs/002-web-app/auth-spec.md
  ticket: null
  adr: null
  pr: null
files:
  - (SQL provided for manual execution in Neon console)
tests:
  - GET /api/auth/get-session returns 200 after schema applied
  - /tasks page remains accessible after login
---

## Prompt

We have a confirmed runtime error from Better Auth:

ERROR [Better Auth]: relation "jwks" does not exist
(PostgreSQL error 42P01)

Observed behavior:
- Sign-up works
- Sign-in works
- /tasks briefly loads
- /api/auth/get-session intermittently returns 500
- User is redirected back to /auth/signin
- Backend FastAPI is not involved
- Database is Neon Postgres
- Better Auth database adapter now uses pg Pool correctly

This proves the Better Auth database schema is INCOMPLETE.

Your task:
1. Identify all REQUIRED Better Auth tables for email/password + JWT auth
2. Provide the EXACT SQL schema needed for the missing tables
3. Ensure the `jwks` table is created correctly
4. Ensure table names, columns, casing, and constraints match Better Auth expectations
5. Do NOT modify frontend logic, routes, or auth flow

## Response snapshot

Analyzed Better Auth source code (node_modules) to extract exact schema requirements:
- Core tables: user, session, account, verification
- JWT plugin table: jwks (with fields: id, public_key, private_key, alg, crv, created_at, expires_at)

Root cause: JWT plugin hook in get-session tries to sign token -> queries jwks table -> table missing -> 500 error -> session treated as invalid -> redirect loop.

Provided complete PostgreSQL schema with:
- All 5 required tables with correct snake_case column names
- Proper foreign key relationships (user_id -> user.id)
- Correct data types (TEXT for IDs, TIMESTAMP WITH TIME ZONE for dates)
- Indexes for performance (session.user_id, session.token, account.user_id)
- IF NOT EXISTS guards for idempotent execution

## Outcome

- Impact: Schema fix resolves auth redirect loop, enables session persistence
- Tests: Manual verification after SQL execution
- Files: SQL statements provided (not committed - run in Neon console)
- Next prompts: Apply SQL in Neon console, verify /api/auth/get-session returns 200
- Reflection: Better Auth auto-migration may not run with pg Pool adapter; manual schema creation required for Neon

## Evaluation notes (flywheel)

- Failure modes observed: Better Auth doesn't auto-create tables when using raw pg Pool
- Graders run and results (PASS/FAIL): N/A - schema investigation task
- Prompt variant (if applicable): N/A
- Next experiment (smallest change to try): Consider using Drizzle adapter or npx better-auth generate for future migrations
