# CLI Command Contracts: In-Memory CLI Todo Application

**Feature**: 001-todo-cli
**Date**: 2026-01-07
**Purpose**: Define command-line interface contracts (user interactions)

## Interface Type: Interactive Menu-Driven CLI

The application presents a numbered menu on each iteration, accepts user input, executes the requested operation, and returns to the menu. The loop continues until the user chooses to exit.

---

## Command: Main Menu

### Display Format

```
=== Todo Application ===

1. Add Task
2. View All Tasks
3. Update Task
4. Delete Task
5. Mark Task Complete/Incomplete
6. Exit

Enter command (1-6):
```

### Inputs

- User enters: single character or number (1-6)

### Outputs

- Branches to corresponding command handler
- Invalid input: "Invalid command. Please enter 1-6."

### Source

spec.md FR-011 (clear prompts and menus)

---

## Command 1: Add Task

### Purpose

Create a new task with a required title and optional description.

### Interaction Flow

```
Enter command (1-6): 1

Enter task title: Buy groceries
Enter task description (optional, press Enter to skip):

Task added successfully!
Task ID: 1
```

### Inputs

| Field | Prompt | Required | Validation |
|-------|--------|----------|------------|
| title | "Enter task title: " | Yes | Non-empty after stripping, ≤ 200 chars |
| description | "Enter task description (optional, press Enter to skip): " | No | ≤ 1000 chars |

### Outputs

**Success**:
```
Task added successfully!
Task ID: {id}
```

**Error - Empty Title**:
```
Error: Task title is required.
```

**Error - Title Too Long**:
```
Error: Task title must be 200 characters or less.
```

**Error - Description Too Long**:
```
Error: Task description must be 1000 characters or less.
```

### Behavior

1. Prompt for title (required)
2. Validate title (non-empty, length check)
3. If invalid, display error, return to menu (do not create task)
4. Prompt for description (optional)
5. Validate description (length check)
6. If invalid, display error, return to menu
7. Call service to create task
8. Display success message with assigned ID
9. Return to main menu

### Mapping

- spec.md FR-001 (add task with title and description)
- spec.md FR-002 (assign unique ID)
- User Story 1, Acceptance Scenario 1 & 2

---

## Command 2: View All Tasks

### Purpose

Display a list of all tasks with their ID, title, description, and completion status.

### Interaction Flow

**With Tasks**:
```
Enter command (1-6): 2

=== All Tasks ===

ID: 1
Title: Buy groceries
Description: (none)
Status: pending

ID: 2
Title: Call dentist
Description: Schedule annual checkup
Status: completed

ID: 3
Title: Finish report
Description: (none)
Status: pending

Total: 3 tasks
```

**Empty List**:
```
Enter command (1-6): 2

=== All Tasks ===

No tasks found. Use option 1 to add a task.
```

### Inputs

None (no user input required)

### Outputs

**Task Display Format** (per task):
```
ID: {id}
Title: {title}
Description: {description or "(none)"}
Status: {"completed" or "pending"}

```

**Empty State**:
```
No tasks found. Use option 1 to add a task.
```

### Behavior

1. Call service to get all tasks
2. If no tasks exist, display empty state message
3. Otherwise, iterate through tasks and display each
4. Display total count
5. Return to main menu

### Mapping

- spec.md FR-003 (display all tasks)
- spec.md FR-012 (friendly message for empty list)
- User Story 1, Acceptance Scenarios 3 & 4

---

## Command 3: Update Task

### Purpose

Update the title and/or description of an existing task identified by ID.

### Interaction Flow

```
Enter command (1-6): 3

Enter task ID to update: 2
What would you like to update?
1. Title
2. Description
3. Both
Enter choice (1-3): 1

Current title: Call dentist
Enter new title: Schedule dentist appointment

Task updated successfully!
```

### Inputs

| Field | Prompt | Required | Validation |
|-------|--------|----------|------------|
| task_id | "Enter task ID to update: " | Yes | Must be valid integer, task must exist |
| update_choice | "Enter choice (1-3): " | Yes | Must be 1, 2, or 3 |
| new_title | "Enter new title: " | If choice 1 or 3 | Non-empty, ≤ 200 chars |
| new_description | "Enter new description: " | If choice 2 or 3 | ≤ 1000 chars |

### Outputs

**Success**:
```
Task updated successfully!
```

**Error - Task Not Found**:
```
Error: Task ID {id} not found.
```

**Error - Invalid ID**:
```
Error: Please enter a valid task ID (number).
```

**Error - Empty Title**:
```
Error: Task title is required.
```

**Error - Title Too Long**:
```
Error: Task title must be 200 characters or less.
```

**Error - Description Too Long**:
```
Error: Task description must be 1000 characters or less.
```

### Behavior

1. Prompt for task ID
2. Validate ID format (must be integer)
3. Call service to verify task exists
4. If not found, display error, return to menu
5. Display current title (for context)
6. Prompt for what to update (title, description, or both)
7. Based on choice:
   - **Title**: Prompt for new title, validate, update
   - **Description**: Prompt for new description, validate, update
   - **Both**: Prompt for both, validate each, update both
8. Call service to update task
9. Display success message
10. Return to main menu

### Mapping

- spec.md FR-004 (update title and/or description by ID)
- User Story 3, Acceptance Scenarios 1, 2, 3, 4

---

## Command 4: Delete Task

### Purpose

Remove a task from the list by ID.

### Interaction Flow

```
Enter command (1-6): 4

Enter task ID to delete: 2
Are you sure you want to delete task 2: "Call dentist"? (y/n): y

Task deleted successfully!
```

### Inputs

| Field | Prompt | Required | Validation |
|-------|--------|----------|------------|
| task_id | "Enter task ID to delete: " | Yes | Must be valid integer, task must exist |
| confirmation | "Are you sure...? (y/n): " | Yes | Must be 'y' or 'n' (case insensitive) |

### Outputs

**Success**:
```
Task deleted successfully!
```

**Cancelled**:
```
Delete cancelled.
```

**Error - Task Not Found**:
```
Error: Task ID {id} not found.
```

**Error - Invalid ID**:
```
Error: Please enter a valid task ID (number).
```

### Behavior

1. Prompt for task ID
2. Validate ID format (must be integer)
3. Call service to get task details
4. If not found, display error, return to menu
5. Display confirmation prompt with task title
6. If user confirms (y):
   - Call service to delete task
   - Display success message
7. If user cancels (n):
   - Display cancellation message
8. Return to main menu

### Mapping

- spec.md FR-005 (delete task by ID)
- spec.md FR-009 (graceful error for non-existent ID)
- User Story 4, Acceptance Scenarios 1, 2, 3

---

## Command 5: Mark Task Complete/Incomplete

### Purpose

Toggle the completion status of a task (pending ↔ completed).

### Interaction Flow

```
Enter command (1-6): 5

Enter task ID to toggle status: 1
Current status: pending

Task marked as completed!
```

### Inputs

| Field | Prompt | Required | Validation |
|-------|--------|----------|------------|
| task_id | "Enter task ID to toggle status: " | Yes | Must be valid integer, task must exist |

### Outputs

**Success - Marked Complete**:
```
Current status: pending
Task marked as completed!
```

**Success - Marked Incomplete**:
```
Current status: completed
Task marked as incomplete!
```

**Error - Task Not Found**:
```
Error: Task ID {id} not found.
```

**Error - Invalid ID**:
```
Error: Please enter a valid task ID (number).
```

### Behavior

1. Prompt for task ID
2. Validate ID format (must be integer)
3. Call service to get current task status
4. If not found, display error, return to menu
5. Display current status
6. Call service to toggle status
7. Display success message with new status
8. Return to main menu

### Mapping

- spec.md FR-006 (toggle completion status)
- spec.md FR-009 (graceful error for non-existent ID)
- User Story 2, Acceptance Scenarios 1, 2, 3

---

## Command 6: Exit

### Purpose

Terminate the application and clear all in-memory data.

### Interaction Flow

```
Enter command (1-6): 6

Goodbye! All tasks have been cleared.
```

### Inputs

None (exit command selected from menu)

### Outputs

```
Goodbye! All tasks have been cleared.
```

### Behavior

1. Display exit message
2. Terminate program
3. All in-memory data cleared automatically (program exit)

### Mapping

- spec.md FR-008 (clear data on program termination)
- spec.md Success Criteria SC-006

---

## Error Handling Principles

### Input Validation Errors

- Display clear, specific error message
- Do NOT crash or terminate program
- Allow user to retry or return to menu
- Example: "Error: Task title is required."

### Non-Existent Task ID

- Check task existence before operations
- Display: "Error: Task ID {id} not found."
- Return to main menu

### Invalid Input Format

- Handle non-numeric input for numeric fields
- Display: "Error: Please enter a valid task ID (number)."
- Allow retry

### General Exception Handling

- Catch unexpected exceptions
- Display: "An unexpected error occurred. Please try again."
- Log error details (if logging implemented)
- Return to menu (do not crash)

---

## User Experience Guidelines

### Clarity

- Use descriptive prompts
- Display current state before changes (e.g., "Current title: ...")
- Confirm successful operations

### Consistency

- All commands follow same pattern: input → validate → execute → feedback → menu
- Error messages follow same format: "Error: {specific message}."

### Forgiveness

- Allow cancellation where appropriate (e.g., delete confirmation)
- Validate early, provide specific feedback
- Never lose user data unexpectedly (except on intentional exit)

---

## Command Summary Table

| Command | Number | User Input | Service Calls | Source |
|---------|--------|------------|---------------|--------|
| Main Menu | - | Command selection (1-6) | None | FR-011 |
| Add Task | 1 | title, description (opt) | create_task() | FR-001, FR-002, US1 |
| View All Tasks | 2 | None | get_all_tasks() | FR-003, FR-012, US1 |
| Update Task | 3 | task_id, field choice, new values | update_task() | FR-004, US3 |
| Delete Task | 4 | task_id, confirmation | delete_task() | FR-005, FR-009, US4 |
| Toggle Status | 5 | task_id | toggle_task_status() | FR-006, US2 |
| Exit | 6 | None | None (program exit) | FR-008, SC-006 |
