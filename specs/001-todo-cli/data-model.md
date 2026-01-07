# Data Model: In-Memory CLI Todo Application

**Feature**: 001-todo-cli
**Date**: 2026-01-07
**Purpose**: Define entities, attributes, relationships, and validation rules

## Entity: Task

### Description

Represents a single todo item with a unique identifier, descriptive information, and completion tracking.

### Attributes

| Attribute | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `id` | int | Yes | Auto-assigned | Unique task identifier, auto-incrementing, immutable after creation |
| `title` | str | Yes | (none) | Task title, 1-200 characters, user-provided |
| `description` | str | No | Empty string | Optional task description, 0-1000 characters, user-provided |
| `is_completed` | bool | Yes | False | Completion status, toggleable by user |

### Attribute Specifications

#### `id` (Task ID)

- **Type**: Positive integer (int)
- **Generation**: Auto-assigned by system, sequential starting from 1
- **Uniqueness**: Unique within session, never reused even after deletion
- **Mutability**: Immutable - cannot be changed after task creation
- **Constraints**: Must be > 0
- **Source**: spec.md FR-002

#### `title` (Task Title)

- **Type**: Non-empty string (str)
- **Length**: 1 to 200 characters
- **Required**: Yes - cannot be empty or whitespace-only
- **Mutability**: Can be updated via update operation
- **Validation**:
  - Strip leading/trailing whitespace before validation
  - After stripping, must have length >= 1
  - Maximum length: 200 characters
  - Error if empty: "Task title is required"
  - Error if too long: "Task title must be 200 characters or less"
- **Source**: spec.md FR-001, FR-004, edge cases

#### `description` (Task Description)

- **Type**: String (str), can be empty
- **Length**: 0 to 1000 characters
- **Required**: No - optional field
- **Default**: Empty string (`""`)
- **Mutability**: Can be updated via update operation
- **Validation**:
  - Empty string is valid
  - Maximum length: 1000 characters
  - Error if too long: "Task description must be 1000 characters or less"
- **Source**: spec.md FR-001, FR-004, edge cases

#### `is_completed` (Completion Status)

- **Type**: Boolean (bool)
- **Required**: Yes
- **Default**: False (pending)
- **Values**:
  - `True`: Task is completed
  - `False`: Task is pending
- **Mutability**: Toggleable via complete/incomplete operation
- **Display Mapping**:
  - `True` → "completed"
  - `False` → "pending"
- **Source**: spec.md FR-006, user stories

### State Transitions

```
[Task Created]
     ↓
is_completed = False (pending)
     ↓
[User toggles status]
     ↓
is_completed = True (completed)
     ↓
[User toggles status again]
     ↓
is_completed = False (pending)
     ↓
     ... (can toggle indefinitely)
```

### Validation Rules

**On Task Creation**:
1. `title` must not be empty after stripping whitespace
2. `title` must be ≤ 200 characters
3. `description` must be ≤ 1000 characters (if provided)
4. `id` is auto-assigned (not user-provided)
5. `is_completed` defaults to False

**On Task Update**:
1. Task must exist (ID must be valid)
2. If updating `title`: same validation as creation
3. If updating `description`: must be ≤ 1000 characters

**On Status Toggle**:
1. Task must exist (ID must be valid)
2. No other validation needed

**On Task Delete**:
1. Task must exist (ID must be valid)

### Relationships

**No relationships** - Task is a standalone entity. This is a single-entity system.

### Storage Model

**In-Memory Storage Structure**:

```python
# Service layer maintains:
tasks: dict[int, Task] = {}        # Task storage, keyed by ID
next_task_id: int = 1              # Auto-increment counter

# Example state after 3 tasks created:
# tasks = {
#     1: Task(id=1, title="Buy groceries", description="", is_completed=False),
#     2: Task(id=2, title="Call dentist", description="Schedule checkup", is_completed=True),
#     3: Task(id=3, title="Finish report", description="", is_completed=False)
# }
# next_task_id = 4
```

**Access Patterns**:
- **Create**: `tasks[next_task_id] = new_task; next_task_id += 1`
- **Read by ID**: `tasks[task_id]` (raises KeyError if not found)
- **Read all**: `tasks.values()`
- **Update**: `tasks[task_id].title = new_title` (after validation)
- **Delete**: `del tasks[task_id]` (raises KeyError if not found)
- **Toggle**: `tasks[task_id].is_completed = not tasks[task_id].is_completed`

**Persistence**: None - all data lost on program exit (per spec.md FR-008)

### Implementation Notes

**Python Representation** (using dataclasses):

The Task entity will be implemented as a Python dataclass with type hints for clarity and validation support.

**Expected Usage Pattern**:
1. User adds task → service validates, assigns ID, stores in dict
2. User views tasks → service returns all tasks from dict values
3. User updates task → service validates, modifies task in place
4. User deletes task → service removes from dict
5. User toggles status → service flips boolean
6. User exits → dict and counter cleared (program terminates)

**Error Conditions**:
- **TaskNotFoundError**: Raised when operation references non-existent task ID
- **ValidationError**: Raised when title is empty or fields exceed length limits

### Mapping to Spec Requirements

| Spec Requirement | Data Model Element |
|------------------|-------------------|
| FR-001: Add task with title (required) and description (optional) | `title` (required), `description` (optional) |
| FR-002: Unique auto-incrementing ID | `id` attribute, auto-generated |
| FR-003: Display ID, title, description, status | All four attributes |
| FR-004: Update title and/or description | `title` and `description` mutability |
| FR-005: Delete task by ID | ID-based dict access |
| FR-006: Toggle completion status | `is_completed` boolean toggle |
| FR-007: Maintain in memory | dict storage in service layer |
| FR-008: Clear on exit | No persistence, dict cleared |
| Edge case: Empty title | `title` validation (min 1 char) |
| Edge case: Long title/description | Length limits (200/1000) |

### Display Format

**Task List View** (example):

```
ID  | Title                | Description          | Status
----|----------------------|----------------------|-----------
1   | Buy groceries        |                      | pending
2   | Call dentist         | Schedule checkup     | completed
3   | Finish report        |                      | pending
```

**Single Task View** (example):

```
Task ID: 2
Title: Call dentist
Description: Schedule checkup
Status: completed
```
