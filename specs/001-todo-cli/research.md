# Research: In-Memory CLI Todo Application

**Feature**: 001-todo-cli
**Date**: 2026-01-07
**Purpose**: Validate technical decisions and resolve uncertainties before detailed design

## Research Questions

### 1. Python CLI Interaction Pattern

**Question**: What is the best practice for implementing an interactive CLI in Python - menu-driven loop vs. subcommand-based (argparse)?

**Decision**: **Interactive menu-driven loop** (input-based command loop)

**Rationale**:
- Spec requires "clear CLI prompts and menus" suggesting interactive experience
- User stories describe workflows within "a single runtime session"
- Menu-driven approach better supports sequential operations (add task, view tasks, update task)
- argparse subcommands require restarting program for each operation (not suitable for session-based workflow)
- Interactive loop matches user expectation: launch once, perform multiple operations, exit when done

**Alternatives Considered**:
- **argparse with subcommands**: Better for one-shot CLI tools (e.g., `git commit`, `docker run`). Rejected because spec describes session-based usage.
- **cmd module (Python REPL-like)**: Too complex for simple menu needs, adds unnecessary abstraction.
- **Simple input() loop with menu**: Selected - minimal, clear, uses standard library

**Implementation Approach**:
- Display numbered menu on each iteration
- Accept numeric or text command input
- Loop until user selects "exit" or equivalent
- Handle invalid input gracefully

**References**:
- Python standard library: `input()` function for interactive prompts
- Context7 guidance: argparse best for subcommand dispatch in multi-command tools

---

### 2. In-Memory Data Structure for Task Storage

**Question**: What Python data structure should store tasks in memory?

**Decision**: **Dictionary with integer keys** (`dict[int, Task]`)

**Rationale**:
- O(1) lookup by task ID (required for update, delete, toggle operations)
- Efficient deletion without reindexing
- ID-based access matches spec requirement ("identified by ID")
- Preserves IDs after deletion (IDs never reused per spec assumptions)
- Simple to implement with standard library

**Alternatives Considered**:
- **List indexed by position**: O(n) lookup by ID, requires scanning. Rejected for performance.
- **List with ID field, linear search**: Same O(n) issue.
- **OrderedDict**: Unnecessary - insertion order not required by spec.

**Implementation Approach**:
- Global or service-level: `tasks: dict[int, Task] = {}`
- ID counter: `next_id: int = 1` (increments on each add)
- Access pattern: `tasks[task_id]` with KeyError handling

---

### 3. Task ID Generation Strategy

**Question**: How should unique task IDs be generated?

**Decision**: **Auto-incrementing integer counter**

**Rationale**:
- Spec assumption: "IDs assigned sequentially starting from 1"
- Simple to implement and understand
- Deterministic and predictable for users
- No external dependency (no UUID library needed)
- Never reused within session (counter only increments)

**Alternatives Considered**:
- **UUID**: Overkill for single-session, in-memory use. Not user-friendly to type/reference.
- **Hash of title**: Not unique (multiple tasks with same title allowed).

**Implementation Approach**:
- Module-level or service-level counter variable
- Increment after each task creation
- ID assignment happens before storing task

---

### 4. Input Validation Strategy

**Question**: How should the application validate and sanitize user input?

**Decision**: **Validate at CLI layer, enforce at service layer**

**Rationale**:
- Separation of concerns: CLI handles user interaction, service enforces business rules
- Title required (cannot be empty or whitespace-only)
- Description optional (can be empty)
- Character limits: 200 for title, 1000 for description (per spec edge cases)
- IDs must be positive integers

**Alternatives Considered**:
- **Validation only in service**: CLI becomes thin wrapper, good separation but less user-friendly error messages.
- **Validation only in CLI**: Breaks separation of concerns, service layer not protected.

**Implementation Approach**:
- CLI layer: Check for empty input, display user-friendly prompts
- Service layer: Enforce length limits, raise ValueError with clear messages
- Error handling: Catch exceptions in CLI, display error, allow retry

---

### 5. Error Handling for Non-Existent Task IDs

**Question**: How should the application handle operations on non-existent task IDs?

**Decision**: **Raise custom exception, catch in CLI, display message, continue**

**Rationale**:
- Spec requirement: "gracefully handled" - don't crash, inform user
- Consistent error message: "Task ID {id} not found"
- User can retry or choose different action
- Follows Python exception handling patterns

**Alternatives Considered**:
- **Return None**: Requires None checks everywhere, less explicit.
- **Print error in service**: Violates separation (service shouldn't do I/O).

**Implementation Approach**:
- Define: `class TaskNotFoundError(Exception)`
- Service methods raise TaskNotFoundError for invalid IDs
- CLI catches exception, displays message, returns to menu

---

### 6. Module Structure and Separation of Concerns

**Question**: How should code be organized into modules?

**Decision**: **Three-layer architecture** (models, services, CLI)

**Rationale**:
- Follows clean architecture principles
- Clear separation of concerns
- Testable (service layer isolated from I/O)
- Matches Python best practices per Context7 guidance

**Module Breakdown**:

1. **models/task.py**: Task data class (no logic)
   - Represents a single task
   - Fields: id, title, description, is_completed
   - No methods beyond initialization

2. **services/task_service.py**: Task management business logic
   - In-memory storage (dict)
   - CRUD operations (create, read, update, delete)
   - Status toggle
   - Validation and error raising

3. **cli/menu.py**: User interface and interaction
   - Display menu and prompts
   - Parse user input
   - Call service methods
   - Display results and errors
   - Main event loop

4. **main.py**: Application entry point
   - Initialize and start CLI loop
   - Can be executed as `python main.py`

**Alternatives Considered**:
- **Single file**: Too monolithic, hard to test and maintain.
- **More layers (repository, controller)**: Over-engineering for simple app.

---

### 7. Testing Strategy (Optional)

**Question**: If tests are written, what should be tested?

**Decision**: **Service layer unit tests** (if tests requested)

**Rationale**:
- Service layer is testable without I/O dependencies
- Core business logic lives in service
- CLI layer requires mocking stdin/stdout (complex for optional tests)
- Per spec: tests are optional

**Test Coverage (if requested)**:
- Task creation with valid inputs
- Task creation with invalid inputs (empty title, too long)
- Task retrieval by ID
- Task update operations
- Task deletion
- Status toggling
- Error cases (non-existent IDs)

**Testing Framework**: Python `unittest` (standard library)

**Alternatives Considered**:
- **pytest**: Not standard library, violates dependency constraint.
- **Integration tests**: Requires mocking CLI, added complexity.

---

## Summary of Key Decisions

| Decision Area | Choice | Justification |
|---------------|--------|---------------|
| CLI Pattern | Interactive menu loop | Session-based workflow, multiple operations |
| Data Structure | `dict[int, Task]` | O(1) lookup, efficient deletion |
| ID Generation | Auto-increment integer | Simple, predictable, meets spec |
| Validation | Layered (CLI + service) | Separation of concerns, user-friendly errors |
| Error Handling | Custom exceptions | Graceful failure, clear messages |
| Module Structure | 3-layer (models, services, CLI) | Clean architecture, testable |
| Testing | Service layer unit tests (optional) | Core logic testable without I/O |

---

## Dependencies Confirmed

**Standard Library Only**:
- `dataclasses`: For Task model (Python 3.7+, in stdlib)
- `typing`: For type hints (Python 3.5+, in stdlib)
- No external dependencies required

**Python Version**: 3.13+ (per Hackathon II requirements)

---

## Next Steps

With research complete:
1. Create data-model.md (Task entity specification)
2. Create contracts/ (CLI command specifications)
3. Create quickstart.md (usage documentation)
4. Proceed to task breakdown in tasks.md
