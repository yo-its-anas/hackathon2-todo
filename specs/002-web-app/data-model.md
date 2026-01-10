# Data Model: Backend REST API & Persistent Data Layer

**Date**: 2026-01-08
**Feature**: 002-web-app
**Phase**: Phase 1 - Design

## Overview

This document defines the database schema and data models for the multi-user Todo application backend. All models use SQLModel for ORM integration with Neon PostgreSQL.

## Entities

### Task

The core entity representing a todo item owned by a user.

**Table Name**: `task`

**Fields**:

| Field Name | Type | Constraints | Description |
|------------|------|-------------|-------------|
| `id` | Integer | PRIMARY KEY, AUTO INCREMENT | Unique task identifier |
| `title` | String(255) | NOT NULL, MIN LENGTH 1 | Task title (required, non-empty) |
| `description` | Text | NULLABLE | Optional detailed description |
| `is_completed` | Boolean | NOT NULL, DEFAULT FALSE | Completion status |
| `created_at` | DateTime | NOT NULL, DEFAULT UTC NOW | Timestamp when task was created |
| `updated_at` | DateTime | NOT NULL, DEFAULT UTC NOW | Timestamp when task was last modified |
| `user_id` | Integer | NOT NULL, FOREIGN KEY, INDEX | Owner user identifier |

**Indexes**:
- Primary key on `id`
- Index on `user_id` (for query performance on user-scoped queries)
- Index on `title` (optional, for future search features)

**Relationships**:
- `user_id` → `user.id` (foreign key constraint, conceptual - User table not implemented in this phase)

**Validation Rules**:
1. `title` must not be empty or contain only whitespace
2. `title` maximum length: 255 characters
3. `description` has no practical length limit (TEXT type)
4. `is_completed` defaults to `false` on creation
5. `created_at` set automatically on insert, never modified
6. `updated_at` set automatically on insert, updated on every modification
7. `user_id` is required (no orphan tasks)

**Business Rules**:
1. Tasks are soft-owned by user_id (no cascade delete in this phase since User table doesn't exist)
2. All queries must filter by `user_id` to enforce data isolation
3. A task cannot be accessed, modified, or deleted if `user_id` doesn't match the requesting user
4. Deleted tasks are hard-deleted (row removed from database)

---

### User (Conceptual - Not Implemented in This Phase)

The User entity is referenced but not created in this specification. The `user_id` field in Task is an integer that will eventually reference a `user.id` primary key.

**Deferred to Future Specification**: Authentication and User Management (Phase 2)

**Current Usage**:
- `user_id` is passed as a URL path parameter: `/api/{user_id}/tasks`
- No validation that `user_id` corresponds to an actual user
- No authentication or session management
- Placeholder for future JWT-based authentication

---

## State Transitions

### Task Lifecycle

```
┌─────────────┐
│   Created   │ (is_completed = false)
│  (default)  │
└──────┬──────┘
       │
       │ PATCH /tasks/{id}/complete
       ├──────────────────────────────────┐
       │                                  │
       ▼                                  ▼
┌─────────────┐                    ┌─────────────┐
│  Completed  │◄───────────────────┤ Incomplete  │
│ (is_comp... │                    │ (is_comp... │
│   = true)   │                    │   = false)  │
└──────┬──────┘                    └──────┬──────┘
       │                                  │
       │ DELETE /tasks/{id}               │
       │                                  │
       ▼                                  ▼
┌─────────────────────────────────────────────┐
│                   Deleted                    │
│              (row removed)                   │
└─────────────────────────────────────────────┘
```

**Transitions**:
1. **Create** → Task created with `is_completed = false`
2. **Toggle Complete** → `is_completed` flips between `true` and `false`
3. **Update** → Title/description modified, `is_completed` unchanged (unless explicitly set)
4. **Delete** → Task row permanently removed from database

---

## SQLModel Implementation

### Task Model (Table)

```python
from datetime import datetime
from typing import Optional
from sqlmodel import Field, SQLModel

class Task(SQLModel, table=True):
    """
    Task entity representing a todo item owned by a user.

    All queries MUST filter by user_id to enforce data isolation.
    """
    id: Optional[int] = Field(default=None, primary_key=True)
    title: str = Field(
        index=True,
        min_length=1,
        max_length=255,
        description="Task title (required, non-empty)"
    )
    description: Optional[str] = Field(
        default=None,
        description="Optional detailed description"
    )
    is_completed: bool = Field(
        default=False,
        description="Completion status"
    )
    created_at: datetime = Field(
        default_factory=datetime.utcnow,
        description="Timestamp when task was created"
    )
    updated_at: datetime = Field(
        default_factory=datetime.utcnow,
        description="Timestamp when task was last modified"
    )
    user_id: int = Field(
        foreign_key="user.id",  # Conceptual FK, user table doesn't exist yet
        index=True,
        description="Owner user identifier"
    )
```

### Request/Response Schemas

**TaskCreate** (Request body for POST `/api/{user_id}/tasks`):
```python
from typing import Optional
from pydantic import Field, field_validator
from sqlmodel import SQLModel

class TaskCreate(SQLModel):
    """Schema for creating a new task."""
    title: str = Field(min_length=1, max_length=255)
    description: Optional[str] = None

    @field_validator('title')
    @classmethod
    def title_not_empty(cls, v: str) -> str:
        """Ensure title is not empty or whitespace."""
        if not v or not v.strip():
            raise ValueError('Title cannot be empty or whitespace')
        return v.strip()
```

**TaskUpdate** (Request body for PUT `/api/{user_id}/tasks/{id}`):
```python
from typing import Optional
from pydantic import Field, field_validator
from sqlmodel import SQLModel

class TaskUpdate(SQLModel):
    """Schema for updating an existing task."""
    title: Optional[str] = Field(default=None, min_length=1, max_length=255)
    description: Optional[str] = None
    is_completed: Optional[bool] = None

    @field_validator('title')
    @classmethod
    def title_not_empty(cls, v: Optional[str]) -> Optional[str]:
        """Ensure title is not empty or whitespace if provided."""
        if v is not None and (not v or not v.strip()):
            raise ValueError('Title cannot be empty or whitespace')
        return v.strip() if v else None
```

**TaskResponse** (Response body for all endpoints):
```python
from datetime import datetime
from typing import Optional
from sqlmodel import SQLModel

class TaskResponse(SQLModel):
    """Schema for task responses."""
    id: int
    title: str
    description: Optional[str]
    is_completed: bool
    created_at: datetime
    updated_at: datetime
    user_id: int
```

---

## Data Isolation Strategy

### Ownership Enforcement

Every database query MUST include a `user_id` filter:

```python
# ✅ CORRECT - filters by user_id
statement = select(Task).where(
    Task.id == task_id,
    Task.user_id == user_id
)

# ❌ INCORRECT - missing user_id filter (data leakage)
statement = select(Task).where(Task.id == task_id)
```

### Query Patterns

**List all user tasks**:
```python
statement = select(Task).where(Task.user_id == user_id)
tasks = session.exec(statement).all()
```

**Get single task**:
```python
statement = select(Task).where(
    Task.id == task_id,
    Task.user_id == user_id
)
task = session.exec(statement).first()
if not task:
    raise HTTPException(status_code=404, detail="Task not found")
```

**Update task**:
```python
# First retrieve with user_id filter
statement = select(Task).where(
    Task.id == task_id,
    Task.user_id == user_id
)
task = session.exec(statement).first()
if not task:
    raise HTTPException(status_code=404, detail="Task not found")

# Then update
task.title = new_title
task.updated_at = datetime.utcnow()
session.add(task)
session.commit()
session.refresh(task)
```

**Delete task**:
```python
# First retrieve with user_id filter
statement = select(Task).where(
    Task.id == task_id,
    Task.user_id == user_id
)
task = session.exec(statement).first()
if not task:
    raise HTTPException(status_code=404, detail="Task not found")

# Then delete
session.delete(task)
session.commit()
```

---

## Database Migration Notes

### Initial Schema Creation

On application startup, create tables if they don't exist:

```python
from sqlmodel import SQLModel, create_engine

engine = create_engine(DATABASE_URL)

def create_db_and_tables():
    SQLModel.metadata.create_all(engine)
```

### Future Migrations

When User table is added in Phase 2:
1. Create `user` table with `id` primary key
2. The existing `user_id` foreign key in `task` will reference `user.id`
3. Consider adding `ON DELETE CASCADE` or `ON DELETE SET NULL` behavior
4. No data migration needed if `user_id` values are preserved

---

## Validation & Constraints Summary

| Field | Database Constraint | Application Validation | Error Response |
|-------|---------------------|------------------------|----------------|
| `title` | VARCHAR(255) NOT NULL | min_length=1, strip whitespace | 400 Bad Request |
| `description` | TEXT NULL | None (optional) | N/A |
| `is_completed` | BOOLEAN NOT NULL DEFAULT FALSE | None (boolean) | N/A |
| `user_id` | INT NOT NULL, FK, INDEX | Must match URL parameter | 404 Not Found |
| `id` (in URL) | INT PRIMARY KEY | Must be valid integer | 404 Not Found |

---

## Performance Considerations

1. **Index on user_id**: Ensures fast lookups for user-scoped queries (most common operation)
2. **Index on title**: Optional, useful for future search/filter features
3. **Connection Pooling**: Neon pooled connection string handles connection reuse
4. **Query Optimization**: Always use indexed fields in WHERE clauses

---

## Security Considerations

1. **Data Isolation**: `user_id` filter prevents horizontal privilege escalation
2. **No Information Leakage**: 404 response for both non-existent and unauthorized tasks
3. **SQL Injection**: SQLModel parameterized queries prevent SQL injection
4. **Input Validation**: Pydantic validators sanitize and validate input before DB operations

---

## Testing Strategy

### Unit Tests (Data Model)

- Task creation with valid data
- Task creation with empty title (should fail)
- Task creation with missing user_id (should fail)
- Task update with valid data
- Updated_at timestamp changes on update
- Created_at timestamp never changes

### Integration Tests (Database)

- Insert task and retrieve by id
- Insert task and retrieve by user_id filter
- Update task and verify changes persist
- Delete task and verify it's removed
- Query with wrong user_id returns empty (no data leakage)

---

## Future Enhancements (Out of Scope for This Phase)

- Add `priority` field (integer, 1-5)
- Add `due_date` field (datetime, nullable)
- Add `tags` relationship (many-to-many with Tag entity)
- Add `category_id` foreign key
- Add soft-delete with `deleted_at` timestamp
- Add full-text search on title/description
- Add pagination for large task lists
