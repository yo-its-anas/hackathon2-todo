# Research: Backend REST API & Persistent Data Layer

**Date**: 2026-01-08
**Feature**: 002-web-app
**Phase**: Phase 0 - Research & Technology Validation

## Research Questions

### 1. FastAPI + SQLModel Async Integration Pattern

**Question**: What is the recommended pattern for async database sessions with FastAPI and SQLModel?

**Research Findings**:

According to FastAPI and SQLModel official documentation:

- **Dependency Injection Pattern**: Use `yield` in dependencies to manage session lifecycle
- **Session Management**: Create engine once at startup, yield sessions per request
- **Type Safety**: Use `Annotated[Session, Depends(get_session)]` for clean type hints
- **Automatic Cleanup**: Code after `yield` executes after response, ensuring cleanup

**Code Pattern**:
```python
from typing import Annotated
from fastapi import Depends
from sqlmodel import Session, create_engine

engine = create_engine(DATABASE_URL)

def get_session():
    with Session(engine) as session:
        yield session

SessionDep = Annotated[Session, Depends(get_session)]

@app.post("/items/")
def create_item(item: Item, session: SessionDep):
    session.add(item)
    session.commit()
    session.refresh(item)
    return item
```

**Decision**: Use synchronous SQLModel sessions with dependency injection. While asyncpg supports async, SQLModel's current stable API uses sync sessions which work well with FastAPI's async/await and provide simpler error handling.

**Rationale**:
- FastAPI handles async I/O at the framework level
- SQLModel sync sessions are simpler and well-documented
- No significant performance penalty for this use case (not high-frequency trading)
- Avoids complexity of async SQLAlchemy context managers

---

### 2. Neon Serverless PostgreSQL Connection Configuration

**Question**: How should we configure database connections for Neon Serverless PostgreSQL?

**Research Findings**:

According to Neon documentation:

- **Connection String Format**: `postgresql://user:pass@host-pooler.region.aws.neon.tech/dbname?sslmode=require`
- **Pooling**: Use `-pooler` suffix in hostname for serverless environments (recommended)
- **SSL**: Always use `sslmode=require` for security
- **Driver**: asyncpg is the recommended async driver for Python
- **Environment Variables**: Store connection string in `.env` file as `DATABASE_URL`

**Code Pattern**:
```python
import os
from sqlmodel import create_engine

DATABASE_URL = os.getenv("DATABASE_URL")
# Example: postgresql://user:pass@ep-cool-darkness-123456-pooler.us-east-2.aws.neon.tech/dbname?sslmode=require

engine = create_engine(DATABASE_URL, echo=True)
```

**Decision**: Use Neon pooled connection string with sync SQLModel engine.

**Rationale**:
- Pooled connections are optimized for serverless/short-lived connections
- SQLModel's `create_engine` handles connection pooling internally
- No need for manual connection pool management
- SSL required for production security

---

### 3. SQLModel Table Definitions with Timestamps

**Question**: How to implement automatic timestamp fields (created_at, updated_at) in SQLModel?

**Research Findings**:

According to SQLModel documentation:

- **Field Definition**: Use `Field(default=..., sa_column_kwargs={...})` for advanced column options
- **Automatic Timestamps**: Use `Field(default_factory=datetime.utcnow)` for created_at
- **Updated Timestamp**: Requires manual update in business logic (SQLModel doesn't have automatic on-update)
- **Nullable Fields**: Use `Optional[str]` for nullable description field

**Code Pattern**:
```python
from datetime import datetime
from typing import Optional
from sqlmodel import Field, SQLModel

class Task(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    title: str = Field(index=True, min_length=1, max_length=255)
    description: Optional[str] = Field(default=None)
    is_completed: bool = Field(default=False)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    user_id: int = Field(foreign_key="user.id", index=True)
```

**Decision**: Use `default_factory=datetime.utcnow` for created_at; manually update updated_at in update operations.

**Rationale**:
- SQLModel doesn't have SQLAlchemy's `onupdate` parameter in simple Field API
- Manual update is explicit and testable
- Ensures updated_at only changes when actual modifications occur

---

### 4. User-Scoped Data Isolation Pattern

**Question**: What's the best practice for filtering queries by user_id to prevent data leakage?

**Research Findings**:

According to SQLModel documentation:

- **Query Filtering**: Use `select(Model).where(Model.user_id == user_id)`
- **Foreign Key Index**: Add `index=True` to foreign key fields for query performance
- **Ownership Enforcement**: Always filter by user_id before any operation (get, update, delete)
- **404 Pattern**: Return 404 for non-existent OR unauthorized resources (don't reveal existence)

**Code Pattern**:
```python
from sqlmodel import select

def get_user_task(session: Session, user_id: int, task_id: int):
    statement = select(Task).where(
        Task.id == task_id,
        Task.user_id == user_id
    )
    task = session.exec(statement).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    return task
```

**Decision**: Every query must include `.where(Task.user_id == user_id)` filter.

**Rationale**:
- Prevents horizontal privilege escalation
- Database-level enforcement (defense in depth)
- Simple to audit and test
- Consistent 404 response doesn't leak information about other users' data

---

### 5. API Error Handling and Validation

**Question**: How should we handle validation errors and return appropriate HTTP status codes?

**Research Findings**:

According to FastAPI documentation:

- **Pydantic Validation**: FastAPI automatically validates request bodies and returns 422 for validation errors
- **Custom Validation**: Use Pydantic validators for complex rules (e.g., non-empty title)
- **404 vs 400**: 404 for resource not found, 400 for malformed requests
- **HTTPException**: Use `HTTPException(status_code=..., detail=...)` for explicit errors

**Code Pattern**:
```python
from fastapi import HTTPException
from pydantic import Field, field_validator

class TaskCreate(SQLModel):
    title: str = Field(min_length=1, max_length=255)
    description: Optional[str] = None

    @field_validator('title')
    @classmethod
    def title_not_empty(cls, v: str) -> str:
        if not v or not v.strip():
            raise ValueError('Title cannot be empty or whitespace')
        return v.strip()
```

**Decision**: Use Pydantic Field constraints + custom validators for input validation; HTTPException for business logic errors.

**Rationale**:
- Leverages FastAPI's automatic validation
- Clear separation between validation errors (422) and not found errors (404)
- Consistent error response format

---

### 6. Project Structure for FastAPI Backend

**Question**: What's the recommended folder structure for a FastAPI backend with separation of concerns?

**Research Findings**:

Standard FastAPI project structure:

```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py           # FastAPI app instance, startup/shutdown events
│   ├── database.py       # Engine, session dependency
│   ├── models/
│   │   ├── __init__.py
│   │   └── task.py       # SQLModel table definitions
│   ├── schemas/
│   │   ├── __init__.py
│   │   └── task.py       # Pydantic request/response schemas
│   ├── routers/
│   │   ├── __init__.py
│   │   └── tasks.py      # API route handlers
│   └── dependencies.py   # Shared dependencies
├── tests/
│   ├── __init__.py
│   ├── test_tasks.py
│   └── conftest.py       # pytest fixtures
├── .env                  # Environment variables
├── requirements.txt      # Python dependencies
└── README.md
```

**Decision**: Use standard FastAPI project structure with clear separation: models, schemas, routers, database.

**Rationale**:
- Clear separation of concerns (SRP)
- Models define database schema
- Schemas define API contracts (separate from DB models for flexibility)
- Routers contain endpoint logic
- Easy to test and maintain

---

## Technology Stack Summary

| Layer | Technology | Version | Justification |
|-------|------------|---------|---------------|
| Framework | FastAPI | 0.115+ | Modern async framework, automatic OpenAPI docs, type safety |
| ORM | SQLModel | 0.0.24+ | Combines SQLAlchemy + Pydantic, FastAPI-native, type-safe |
| Database | Neon PostgreSQL | Latest | Serverless, autoscaling, zero-downtime branching |
| Driver | psycopg2 (sync) | Latest | Stable, well-supported with SQLModel sync sessions |
| Validation | Pydantic | 2.0+ (via SQLModel) | Automatic validation, serialization, type hints |
| Testing | pytest + httpx | Latest | Standard Python testing, async client for FastAPI |
| Server | Uvicorn | Latest | ASGI server for FastAPI |

## Resolved Unknowns

All technical unknowns from the initial planning phase have been resolved:

1. ✅ **FastAPI + SQLModel Integration**: Dependency injection with `yield` pattern
2. ✅ **Neon Connection**: Pooled connection string with SSL, sync engine
3. ✅ **Timestamps**: `default_factory=datetime.utcnow` + manual updated_at
4. ✅ **User Isolation**: Always filter queries by `user_id` foreign key
5. ✅ **Error Handling**: Pydantic validation (422) + HTTPException (404/400)
6. ✅ **Project Structure**: Standard FastAPI layout with separation of concerns

## Next Steps

- **Phase 1**: Create data-model.md with concrete Task schema
- **Phase 1**: Generate OpenAPI contract in contracts/ directory
- **Phase 1**: Write quickstart.md with setup instructions
- **Phase 2**: Generate tasks.md from the plan (via `/sp.tasks`)
- **Phase 3**: Implementation via `/sp.implement`

## References

- FastAPI SQL Databases Tutorial: https://fastapi.tiangolo.com/tutorial/sql-databases/
- SQLModel Official Docs: https://sqlmodel.tiangolo.com/
- Neon Python Guide: https://neon.tech/docs/guides/python
- FastAPI Dependency Injection: https://fastapi.tiangolo.com/tutorial/dependencies/dependencies-with-yield/
