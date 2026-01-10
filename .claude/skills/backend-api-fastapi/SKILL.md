---
name: backend-api-fastapi
description: Implement REST APIs in FastAPI exactly according to specification, with secure, user-scoped data access.
---

# Backend API (FastAPI Core) Skill

## Instructions

1. **API Structure & Routing**
   - FastAPI router-based organization
   - Versioned endpoints (e.g. `/api/v1`)
   - Clear separation of concerns (routers, services, schemas)
   - Dependency injection for shared logic

2. **RESTful API Design**
   - Resource-oriented endpoints
   - Proper HTTP methods (GET, POST, PUT, PATCH, DELETE)
   - Consistent request and response models
   - Accurate status codes and error responses

3. **SQLModel CRUD Operations**
   - Create, read, update, and delete patterns
   - Async session usage
   - Transaction safety and rollbacks
   - Pagination and filtering where applicable

4. **Secure User-Scoped Queries**
   - Always scope queries to the authenticated user
   - Prevent horizontal privilege escalation
   - Use dependencies to inject `current_user`
   - Enforce ownership at the query level

## Best Practices
- Follow the API spec exactly—no extra fields or endpoints
- Keep endpoints thin; move logic into services
- Validate input with Pydantic models
- Return consistent error formats
- Never trust client-provided identifiers for ownership

