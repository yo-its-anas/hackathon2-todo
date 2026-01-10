# Feature Specification: Backend REST API & Persistent Data Layer

**Feature Branch**: `002-web-app`
**Created**: 2026-01-08
**Status**: Draft
**Input**: User description: "Transform the existing single-user in-memory CLI Todo application into a multi-user, persistent RESTful backend service using FastAPI, SQLModel, and Neon Serverless PostgreSQL, while preserving all five core Todo features."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - View All Tasks (Priority: P1)

A user wants to see all their tasks in the system so they can review what needs to be done.

**Why this priority**: Core viewing capability - the foundation for all other task operations. Without this, users cannot interact with their tasks.

**Independent Test**: Can be fully tested by creating tasks for a user and retrieving the list. Delivers immediate value by allowing users to view their task inventory.

**Acceptance Scenarios**:

1. **Given** a user has 5 tasks in the system, **When** they request their task list, **Then** all 5 tasks are returned with complete details (id, title, description, completion status, timestamps)
2. **Given** a user has no tasks, **When** they request their task list, **Then** an empty list is returned
3. **Given** multiple users exist with tasks, **When** User A requests their tasks, **Then** only User A's tasks are returned (no data leakage from other users)

---

### User Story 2 - Create New Task (Priority: P1)

A user wants to add a new task to their list so they can track something they need to do.

**Why this priority**: Essential creation capability. Without this, users cannot add tasks to the system. This is a critical user journey for the application to be useful.

**Independent Test**: Can be fully tested by submitting task creation requests and verifying the task appears in the system with correct attributes and ownership.

**Acceptance Scenarios**:

1. **Given** a user is authenticated, **When** they create a task with title "Buy groceries" and description "Milk, eggs, bread", **Then** the task is saved with is_completed=false, assigned to that user, and given timestamps
2. **Given** a user creates a task with only a title (no description), **When** the task is saved, **Then** it succeeds with description as null/empty
3. **Given** a user submits an empty title, **When** attempting to create the task, **Then** the request is rejected with 400 Bad Request
4. **Given** a task is created by User A, **When** User B requests their task list, **Then** User A's task does not appear in User B's results

---

### User Story 3 - View Single Task Details (Priority: P2)

A user wants to view the full details of a specific task so they can review its information.

**Why this priority**: Important for task detail inspection but users can still function with list view alone. Enhances usability by allowing focused task examination.

**Independent Test**: Can be tested by creating a task and retrieving it by ID. Delivers value by providing detailed single-task inspection.

**Acceptance Scenarios**:

1. **Given** a user has a task with ID 123, **When** they request task 123, **Then** the complete task details are returned
2. **Given** a user requests a task ID that doesn't exist, **When** the request is processed, **Then** 404 Not Found is returned
3. **Given** User A has task 123 and User B requests task 123, **When** the request is processed, **Then** 404 Not Found is returned (ownership enforcement)

---

### User Story 4 - Update Task (Priority: P2)

A user wants to modify a task's title or description so they can correct or refine task information.

**Why this priority**: Important for maintaining accurate task data but not blocking core usage. Users can create new tasks if they can't edit, though it's inconvenient.

**Independent Test**: Can be tested by creating a task, modifying its attributes, and verifying the changes persist correctly.

**Acceptance Scenarios**:

1. **Given** a user has task 123 with title "Old title", **When** they update it to "New title", **Then** the task title changes and updated_at timestamp is refreshed
2. **Given** a user updates their task's description, **When** they retrieve the task, **Then** the new description is returned
3. **Given** User A tries to update User B's task, **When** the request is processed, **Then** 404 Not Found is returned
4. **Given** a user updates a task with invalid data (empty title), **When** the request is processed, **Then** 400 Bad Request is returned and the task remains unchanged

---

### User Story 5 - Delete Task (Priority: P3)

A user wants to permanently remove a task from their list so they can clean up completed or irrelevant tasks.

**Why this priority**: Useful for cleanup but not essential for basic task management. Users can work around this by marking tasks complete or ignoring them.

**Independent Test**: Can be tested by creating a task, deleting it, and verifying it no longer appears in queries or retrieval attempts.

**Acceptance Scenarios**:

1. **Given** a user has task 123, **When** they delete it, **Then** the task is removed and subsequent retrieval returns 404
2. **Given** a user deletes a non-existent task, **When** the request is processed, **Then** 404 Not Found is returned
3. **Given** User A tries to delete User B's task, **When** the request is processed, **Then** 404 Not Found is returned

---

### User Story 6 - Toggle Task Completion (Priority: P1)

A user wants to mark a task as complete or incomplete so they can track task progress.

**Why this priority**: Critical for task management - the primary action users perform to track work. This is the core value proposition of a todo application.

**Independent Test**: Can be tested by creating tasks and toggling their completion status, verifying the state changes persist correctly.

**Acceptance Scenarios**:

1. **Given** a task is incomplete (is_completed=false), **When** the user toggles completion, **Then** is_completed becomes true and updated_at is refreshed
2. **Given** a task is complete (is_completed=true), **When** the user toggles completion again, **Then** is_completed becomes false
3. **Given** User A tries to toggle User B's task completion, **When** the request is processed, **Then** 404 Not Found is returned
4. **Given** a user toggles completion on a non-existent task, **When** the request is processed, **Then** 404 Not Found is returned

---

### Edge Cases

- What happens when a user requests tasks with a malformed user_id (non-integer, special characters)?
- How does the system handle extremely long task titles or descriptions (e.g., 10,000+ characters)?
- What happens when database connection is lost during a write operation?
- How does the system handle concurrent updates to the same task by the same user?
- What happens when a user attempts operations with invalid task IDs (negative numbers, non-integers)?
- How does the system respond to requests with missing required fields in the request body?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST persist all task data to Neon Serverless PostgreSQL database
- **FR-002**: System MUST provide REST API endpoints for all six core task operations (create, list, get, update, delete, toggle completion)
- **FR-003**: System MUST filter all task queries by user_id to ensure data isolation
- **FR-004**: System MUST prevent users from accessing, modifying, or deleting tasks that do not belong to them
- **FR-005**: System MUST return 404 Not Found when a task does not exist or does not belong to the requesting user
- **FR-006**: System MUST return 400 Bad Request for invalid input (e.g., empty task title, malformed request body)
- **FR-007**: System MUST automatically set created_at timestamp when a task is created
- **FR-008**: System MUST automatically update updated_at timestamp when a task is modified
- **FR-009**: System MUST validate that task title is non-empty before saving
- **FR-010**: System MUST support optional task descriptions (can be null/empty)
- **FR-011**: System MUST maintain task completion status (is_completed boolean field)
- **FR-012**: System MUST assign each task a unique identifier (primary key)
- **FR-013**: System MUST associate each task with exactly one user via user_id foreign key
- **FR-014**: System MUST handle multiple concurrent users without data collision
- **FR-015**: System MUST preserve all task data across server restarts

### Key Entities

- **Task**: Represents a todo item with attributes including unique identifier, title (required text), description (optional text), completion status (boolean), creation timestamp, last updated timestamp, and owner user identifier
- **User**: Implicit entity representing task ownership via user_id - actual User entity and authentication will be defined in subsequent specifications

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can create a task and see it appear in their task list within 2 seconds
- **SC-002**: System correctly isolates task data such that 100% of queries return only the requesting user's tasks (zero data leakage)
- **SC-003**: All task data persists across server restarts with 100% integrity (no data loss)
- **SC-004**: System handles 100 concurrent users performing task operations without errors or data corruption
- **SC-005**: Users can perform all six core task operations (create, list, get, update, delete, toggle) successfully with appropriate success/error responses
- **SC-006**: System returns correct HTTP status codes (200, 400, 404) for all request scenarios
- **SC-007**: Invalid requests (empty titles, non-existent tasks, unauthorized access) are rejected 100% of the time with appropriate error responses

## Assumptions *(mandatory)*

- User authentication and authorization will be implemented in a subsequent specification (this spec assumes user_id is provided via URL parameter without JWT validation)
- User entity and user management endpoints (registration, login) will be defined separately
- The user_id in URL paths is assumed to be valid and will not be validated against an actual User table in this phase
- Database schema migrations will be handled manually or via tooling outside this specification
- Environment configuration (database connection strings, secrets) will be provided via .env files
- Standard REST API conventions apply (JSON request/response bodies, standard HTTP methods and status codes)
- Task title length limit is assumed to be 255 characters (standard varchar default) unless specified otherwise
- Task description has no practical length limit (TEXT field type)
- The system will use UTC timezone for all timestamps
- Database connection pooling and optimization will use framework/ORM defaults

## Constraints

- Must use Python 3.13+
- Must use FastAPI framework for HTTP layer
- Must use SQLModel as ORM
- Must use Neon Serverless PostgreSQL as database
- Must implement asynchronous request handling where supported by framework
- Must maintain clear separation between API routes, business logic, and database session management
- No authentication enforcement in this phase (JWT validation excluded)
- No frontend implementation (pure backend API)
- No manual coding - implementation must be generated via Claude Code agents
- Must follow Agentic Dev Stack workflow

## Out of Scope

- Authentication and authorization logic (JWT verification, middleware, session management)
- User registration, login, password reset endpoints
- Frontend UI or client applications
- Admin or cross-user task access capabilities
- Real-time updates via websockets or server-sent events
- Task sharing or collaboration features
- Task categories, tags, or labels
- Task priority or due dates
- Task attachments or file uploads
- Search or filtering beyond user_id
- Pagination for large task lists
- Rate limiting or API throttling
- Caching layer (Redis, etc.)
- Email notifications or reminders
- Audit logging or activity history

## Dependencies

- Neon Serverless PostgreSQL instance must be provisioned and accessible
- Database connection credentials must be available via environment configuration
- Python 3.13+ runtime environment
- Required Python packages: FastAPI, SQLModel, asyncpg (or equivalent PostgreSQL driver), pydantic, uvicorn

## API Contract Reference

### Endpoint Summary

| Method | Endpoint | Description | Success Response | Error Responses |
|--------|----------|-------------|------------------|-----------------|
| GET | `/api/{user_id}/tasks` | List all user tasks | 200 OK with task array | - |
| POST | `/api/{user_id}/tasks` | Create new task | 201 Created with task object | 400 Bad Request |
| GET | `/api/{user_id}/tasks/{id}` | Get task details | 200 OK with task object | 404 Not Found |
| PUT | `/api/{user_id}/tasks/{id}` | Update task | 200 OK with updated task | 400 Bad Request, 404 Not Found |
| DELETE | `/api/{user_id}/tasks/{id}` | Delete task | 204 No Content | 404 Not Found |
| PATCH | `/api/{user_id}/tasks/{id}/complete` | Toggle completion | 200 OK with updated task | 404 Not Found |

### Task Schema

```
{
  "id": integer (primary key, auto-generated),
  "title": string (required, non-empty),
  "description": string (optional, nullable),
  "is_completed": boolean (default: false),
  "created_at": datetime (auto-generated),
  "updated_at": datetime (auto-updated),
  "user_id": integer (required, foreign key concept)
}
```

## Notes

This specification establishes the foundational backend infrastructure for the multi-user Todo web application. The focus is exclusively on data persistence, REST API behavior, and user-scoped data isolation. Authentication enforcement (JWT validation, middleware) will be layered on in subsequent specifications without requiring changes to the core API structure or endpoints.

The API contract defined here matches the CLI application's five core features (create, list, get, update, delete) plus the sixth feature (toggle completion) implemented as a dedicated PATCH endpoint for semantic clarity.

All endpoints use user_id in the URL path as a placeholder for future authentication integration. In the next phase, this user_id will be extracted from JWT tokens rather than URL parameters, ensuring only authenticated users can access their own tasks.
