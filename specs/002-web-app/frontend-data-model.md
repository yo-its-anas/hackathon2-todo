# Data Model: Frontend State & Types

**Feature**: 002-web-app (Frontend Completion)
**Created**: 2026-01-08
**Purpose**: Define TypeScript interfaces and state shape for frontend application

## Type Definitions

### Task Entity

```typescript
export interface Task {
  id: number
  title: string
  description: string | null
  is_completed: boolean
  user_id: string
  created_at: string  // ISO 8601 datetime
  updated_at: string  // ISO 8601 datetime
}
```

**Source**: Backend API response schema (already defined in backend/app/schemas/task.py)

**Validation Rules**:
- `id`: Positive integer, assigned by backend
- `title`: Required, non-empty string, max 255 characters
- `description`: Optional string, can be null or empty
- `is_completed`: Boolean, defaults to false
- `user_id`: String, must match authenticated user
- `created_at`: ISO 8601 timestamp, assigned by backend
- `updated_at`: ISO 8601 timestamp, updated on every modification

### Task Creation Request

```typescript
export interface TaskCreate {
  title: string
  description?: string | null
}
```

**Validation Rules**:
- `title`: Required, must be non-empty after trim, max 255 characters
- `description`: Optional, can be omitted, null, or empty string

### Task Update Request

```typescript
export interface TaskUpdate {
  title?: string
  description?: string | null
  is_completed?: boolean
}
```

**Validation Rules**:
- All fields optional (partial update supported)
- `title`: If provided, must be non-empty, max 255 characters
- At least one field must be provided

### User Session

```typescript
export interface UserSession {
  user: {
    id: string
    name: string
    email: string
  }
  // Additional Better Auth session fields managed by library
}
```

**Source**: Better Auth session object (managed by Better Auth library)

## Component State Models

### TasksPage State

```typescript
interface TasksPageState {
  // Data
  tasks: Task[]
  userId: string | null

  // Form state
  newTaskTitle: string
  newTaskDescription: string
  editingTaskId: number | null
  editTitle: string
  editDescription: string

  // UI state
  loading: boolean
  error: string
  deletingTaskId: number | null
}
```

**State Transitions**:
1. **Initial Load**: loading=true → fetch tasks → loading=false, tasks populated
2. **Create Task**: loading=true → POST → loading=false, task appended to list
3. **Edit Task**: editingTaskId set → user modifies → PUT → editingTaskId=null, task updated
4. **Delete Task**: deletingTaskId set → DELETE → deletingTaskId=null, task removed
5. **Toggle Complete**: PATCH → task updated in place
6. **Error**: Any operation fails → error set, loading=false

### Auth Pages State

```typescript
interface AuthPageState {
  // Sign Up
  name: string
  email: string
  password: string

  // Sign In
  email: string
  password: string

  // Common
  loading: boolean
  error: string
}
```

## API Response Contracts

### Success Responses

```typescript
// GET /api/{user_id}/tasks
Response: Task[]

// POST /api/{user_id}/tasks
Request: TaskCreate
Response: Task

// GET /api/{user_id}/tasks/{id}
Response: Task

// PUT /api/{user_id}/tasks/{id}
Request: TaskUpdate
Response: Task

// PATCH /api/{user_id}/tasks/{id}/complete
Response: Task

// DELETE /api/{user_id}/tasks/{id}
Response: 204 No Content
```

### Error Responses

```typescript
interface ErrorResponse {
  detail: string  // Human-readable error message
}

// 401 Unauthorized - Missing or invalid JWT
{
  "detail": "Token expired" | "Invalid token" | "Missing token"
}

// 403 Forbidden - Valid JWT but wrong user
{
  "detail": "Cannot access resources for user {user_id}"
}

// 404 Not Found - Task doesn't exist
{
  "detail": "Task {id} not found for user {user_id}"
}

// 422 Validation Error - Invalid input
{
  "detail": [
    {
      "loc": ["body", "title"],
      "msg": "Field required",
      "type": "missing"
    }
  ]
}

// 500 Internal Server Error
{
  "detail": "Internal server error"
}
```

## State Management Strategy

**Approach**: Local component state with React hooks (no global state management)

**Rationale**:
- Application has simple state requirements (single task list)
- No need to share state between disconnected components
- Reduces complexity and bundle size
- Easier to reason about data flow

**State Location**:
- Task list state: TasksPage component
- Form state: Inline in TasksPage component
- Auth session: Managed by Better Auth library
- Loading/error states: Co-located with data they represent

**No Redux/MobX/Zustand**: Specification emphasizes simplicity and correctness over advanced features

## Data Flow Diagrams

### Task Creation Flow

```
User Input → Form State → Validation
                ↓
            API Client (+ JWT)
                ↓
            Backend API
                ↓
            Database
                ↓
            Response (new Task)
                ↓
            Update Local State
                ↓
            Re-render UI
```

### Task List Load Flow

```
Component Mount → Check Session
                      ↓
                  Get User ID
                      ↓
                  API Request (+ JWT)
                      ↓
                  Backend (verify JWT)
                      ↓
                  Database Query
                      ↓
                  Response (Task[])
                      ↓
                  Update Local State
                      ↓
                  Render Task List
```

### Session Expiry Flow

```
User Action → API Request (+ JWT)
                  ↓
            Backend JWT Verification
                  ↓
            Token Expired (401)
                  ↓
            Frontend api-client.ts detects 401
                  ↓
            Redirect to /auth/signin
                  ↓
            Clear local state
```

## Validation Rules Summary

### Client-Side Validation (Before API Call)

1. **Task Title**:
   - Required: Must not be empty after trim
   - Length: Max 255 characters
   - Display error inline if validation fails

2. **Task Description**:
   - Optional: Can be empty or omitted
   - No length limit enforced client-side (backend handles)

3. **Email (Auth)**:
   - Required: Must not be empty
   - Format: Must match email pattern (HTML5 type="email")
   - Display error inline if validation fails

4. **Password (Auth)**:
   - Required: Must not be empty
   - Length: Minimum 8 characters
   - Display error inline if validation fails

### Server-Side Validation (Backend Responsibility)

- Backend performs authoritative validation
- Client validation is UX enhancement only
- Display backend validation errors returned in 422 responses

## Empty State Handling

```typescript
// Zero tasks
if (tasks.length === 0 && !loading) {
  return (
    <div className="empty-state">
      <p>You haven't created any tasks yet.</p>
      <p>Start by adding your first task above!</p>
    </div>
  )
}
```

## Error State Handling

```typescript
// Network error
if (error) {
  return (
    <div className="error-state">
      <p>Error: {error}</p>
      <button onClick={retry}>Try Again</button>
    </div>
  )
}
```

## Loading State Handling

```typescript
// Initial load
if (loading && tasks.length === 0) {
  return <div className="loading-state">Loading tasks...</div>
}

// Action in progress
<button disabled={loading}>
  {loading ? 'Creating...' : 'Create Task'}
</button>
```

## Type Safety Guarantees

- All API responses typed with TypeScript interfaces
- No `any` types used
- Strict null checks enabled
- Form inputs validated before API calls
- API errors caught and typed

This data model ensures type-safe communication between frontend components, API client, and backend services.
