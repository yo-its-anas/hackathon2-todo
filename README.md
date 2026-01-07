# In-Memory CLI Todo Application

A simple command-line todo application built with Python that stores tasks in memory.

## Prerequisites

- Python 3.13 or higher

## Installation

1. Clone or download this repository
2. No external dependencies required - uses Python standard library only

## How to Run

From the repository root directory, run:

```bash
python main.py
```

## Usage

The application provides an interactive menu with the following options:

### 1. Add Task
Create a new task with a title (required) and optional description.
- Title: 1-200 characters (required)
- Description: 0-1000 characters (optional)

### 2. View All Tasks
Display all tasks with their:
- ID
- Title
- Description
- Status (pending or completed)

### 3. Update Task
Modify an existing task's title and/or description.
- Choose to update title only, description only, or both
- Same character limits apply as when adding tasks

### 4. Delete Task
Remove a task by ID with confirmation prompt.

### 5. Mark Task Complete/Incomplete
Toggle a task's completion status between pending and completed.

### 6. Exit
Close the application.

## Example Session

```
=== Todo Application ===

1. Add Task
2. View All Tasks
3. Update Task
4. Delete Task
5. Mark Task Complete/Incomplete
6. Exit

Enter command (1-6): 1

Enter task title: Buy groceries
Enter task description (optional, press Enter to skip): Milk, eggs, bread

Task added successfully!
Task ID: 1
```

## Limitations

- **In-memory storage only**: All tasks are lost when the application exits
- **No data persistence**: Tasks are not saved to disk or database
- **Single user**: No multi-user support or authentication
- **No search or filter**: Tasks can only be viewed as a complete list
- **Sequential IDs**: Task IDs increment from 1 and are not reused after deletion

## Project Structure

```
todo-app/
├── main.py                    # Application entry point
├── src/
│   ├── __init__.py
│   ├── models/
│   │   ├── __init__.py
│   │   └── task.py           # Task data model
│   ├── services/
│   │   ├── __init__.py
│   │   └── task_service.py   # Business logic and storage
│   └── cli/
│       ├── __init__.py
│       └── menu.py            # CLI interface and handlers
└── README.md
```

## License

This project is part of a Hackathon II submission and is provided as-is for educational purposes.
