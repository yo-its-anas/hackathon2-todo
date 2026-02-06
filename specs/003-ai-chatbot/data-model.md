# Data Model: Todo AI Chatbot

**Feature**: 003-ai-chatbot
**Date**: 2026-02-03

## Entity Overview

```
┌─────────────────┐       ┌─────────────────┐       ┌─────────────────┐
│      User       │       │   Conversation  │       │     Message     │
│  (Better Auth)  │       │                 │       │                 │
├─────────────────┤       ├─────────────────┤       ├─────────────────┤
│ id (string)     │──1:N──│ id              │──1:N──│ id              │
│ ...             │       │ user_id (FK)    │       │ conversation_id │
└─────────────────┘       │ created_at      │       │ user_id         │
                          │ updated_at      │       │ role            │
                          └─────────────────┘       │ content         │
                                                    │ tool_calls?     │
        ┌─────────────────┐                         │ created_at      │
        │      Task       │                         └─────────────────┘
        │   (Existing)    │
        ├─────────────────┤
        │ id              │
        │ user_id (FK)    │
        │ title           │
        │ description     │
        │ is_completed    │
        │ created_at      │
        │ updated_at      │
        └─────────────────┘
```

## Existing Entity: Task

**Location**: `backend/app/models/task.py`

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | int | PK, auto-increment | Unique identifier |
| user_id | str | NOT NULL, indexed | Owner's user ID |
| title | str | NOT NULL, max 255 | Task title |
| description | str | nullable | Optional details |
| is_completed | bool | default False | Completion status |
| created_at | datetime | default now() | Creation timestamp |
| updated_at | datetime | default now() | Last modification |

**Note**: No schema changes needed for Task. Chatbot uses existing model via MCP tools.

---

## New Entity: Conversation

**Purpose**: Groups related chat messages into sessions for a user.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | int | PK, auto-increment | Unique identifier |
| user_id | str | NOT NULL, indexed | Owner's user ID |
| created_at | datetime | default now() | Session start time |
| updated_at | datetime | default now() | Last activity |

**Indexes**:
- `idx_conversation_user_id` on `user_id` for user session lookup

**Business Rules**:
- One active conversation per user (can support multiple in future)
- Conversation auto-created on first chat if none exists
- `updated_at` refreshed on each new message

---

## New Entity: Message

**Purpose**: Stores individual chat messages for conversation history.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | int | PK, auto-increment | Unique identifier |
| conversation_id | int | FK → Conversation.id | Parent conversation |
| user_id | str | NOT NULL, indexed | Owner (denormalized for query perf) |
| role | str(enum) | NOT NULL | user \| assistant \| tool |
| content | text | NOT NULL | Message text content |
| tool_calls | json | nullable | Tool invocation metadata |
| created_at | datetime | default now() | Message timestamp |

**Indexes**:
- `idx_message_conversation_created` on `(conversation_id, created_at)` for history retrieval
- `idx_message_user_id` on `user_id` for user-scoped queries

**Business Rules**:
- Messages ordered by `created_at` ascending
- `role` enum: "user" (human), "assistant" (AI), "tool" (tool result)
- `tool_calls` stores JSON of MCP tool invocations when role=assistant
- Max 50 recent messages loaded for context (configurable)

---

## SQLModel Definitions

### Conversation Model

```python
# backend/app/models/conversation.py
from datetime import datetime
from typing import Optional, List
from sqlmodel import Field, SQLModel, Relationship


class Conversation(SQLModel, table=True):
    """Chat conversation session for a user."""

    __tablename__ = "conversations"

    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: str = Field(nullable=False, index=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    # Relationship to messages
    messages: List["Message"] = Relationship(back_populates="conversation")
```

### Message Model

```python
# backend/app/models/message.py
from datetime import datetime
from typing import Optional, Any
from sqlmodel import Field, SQLModel, Relationship
from sqlalchemy import Column, JSON


class Message(SQLModel, table=True):
    """Individual chat message within a conversation."""

    __tablename__ = "messages"

    id: Optional[int] = Field(default=None, primary_key=True)
    conversation_id: int = Field(foreign_key="conversations.id", nullable=False)
    user_id: str = Field(nullable=False, index=True)
    role: str = Field(nullable=False)  # user | assistant | tool
    content: str = Field(nullable=False)
    tool_calls: Optional[dict] = Field(default=None, sa_column=Column(JSON))
    created_at: datetime = Field(default_factory=datetime.utcnow)

    # Relationship to conversation
    conversation: Optional["Conversation"] = Relationship(back_populates="messages")
```

---

## State Transitions

### Conversation States

```
[No Conversation]
       │
       │ First chat message
       ▼
   [Active] ◄────────────────┐
       │                     │
       │ New message         │
       │ (updates timestamp) │
       └─────────────────────┘
```

### Message Flow

```
User sends message
       │
       ▼
┌──────────────────┐
│ Save user message│
│ (role: user)     │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ Agent processes  │
│ with context     │
└────────┬─────────┘
         │
    ┌────┴────┐
    │         │
    ▼         ▼
[Direct    [Tool Call]
Response]      │
    │          ▼
    │    ┌──────────┐
    │    │Execute   │
    │    │MCP Tool  │
    │    └────┬─────┘
    │         │
    │         ▼
    │    ┌──────────┐
    │    │Save tool │
    │    │message   │
    │    └────┬─────┘
    │         │
    └────┬────┘
         │
         ▼
┌──────────────────┐
│ Save assistant   │
│ message          │
└──────────────────┘
```

---

## Data Validation Rules

### Conversation
- `user_id`: Must be valid UUID string from Better Auth
- `updated_at`: Auto-updated via trigger or application logic

### Message
- `role`: Must be one of: "user", "assistant", "tool"
- `content`: Non-empty string, max 10,000 characters
- `tool_calls`: Valid JSON when present, null otherwise
- `conversation_id`: Must reference existing conversation

---

## Query Patterns

### Load Conversation Context
```sql
SELECT m.* FROM messages m
JOIN conversations c ON m.conversation_id = c.id
WHERE c.user_id = :user_id
ORDER BY m.created_at DESC
LIMIT 50;
```

### Get or Create Conversation
```sql
-- Find existing
SELECT * FROM conversations
WHERE user_id = :user_id
ORDER BY updated_at DESC
LIMIT 1;

-- Or create new
INSERT INTO conversations (user_id, created_at, updated_at)
VALUES (:user_id, NOW(), NOW())
RETURNING *;
```

### Save Message
```sql
INSERT INTO messages (conversation_id, user_id, role, content, tool_calls, created_at)
VALUES (:conv_id, :user_id, :role, :content, :tool_calls, NOW())
RETURNING *;

-- Update conversation timestamp
UPDATE conversations SET updated_at = NOW() WHERE id = :conv_id;
```

---

## Migration Plan

### Migration 001: Create conversations table
```sql
CREATE TABLE conversations (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_conversation_user_id ON conversations(user_id);
```

### Migration 002: Create messages table
```sql
CREATE TABLE messages (
    id SERIAL PRIMARY KEY,
    conversation_id INTEGER NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    user_id VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('user', 'assistant', 'tool')),
    content TEXT NOT NULL,
    tool_calls JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_message_conversation_created ON messages(conversation_id, created_at);
CREATE INDEX idx_message_user_id ON messages(user_id);
```
