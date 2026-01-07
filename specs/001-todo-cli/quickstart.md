# Quickstart Guide: In-Memory CLI Todo Application

**Feature**: 001-todo-cli
**Last Updated**: 2026-01-07

## Prerequisites

- Python 3.13 or higher
- Terminal/Command Prompt

## Installation

1. Clone or download the repository
2. Navigate to the project directory:
   ```bash
   cd todo-app
   ```

3. Verify Python version:
   ```bash
   python --version  # Should show 3.13 or higher
   ```

## Running the Application

### Start the Application

```bash
python main.py
```

### First Time Usage

When you start the application, you'll see the main menu:

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

## Basic Workflow

### 1. Add Your First Task

```
Enter command (1-6): 1

Enter task title: Buy groceries
Enter task description (optional, press Enter to skip):

Task added successfully!
Task ID: 1
```

**Tip**: Descriptions are optional. Press Enter to skip.

### 2. View Your Tasks

```
Enter command (1-6): 2

=== All Tasks ===

ID: 1
Title: Buy groceries
Description: (none)
Status: pending

Total: 1 task
```

### 3. Mark a Task Complete

```
Enter command (1-6): 5

Enter task ID to toggle status: 1
Current status: pending

Task marked as completed!
```

### 4. Update a Task

```
Enter command (1-6): 3

Enter task ID to update: 1
What would you like to update?
1. Title
2. Description
3. Both
Enter choice (1-3): 2

Enter new description: At Whole Foods

Task updated successfully!
```

### 5. Delete a Task

```
Enter command (1-6): 4

Enter task ID to delete: 1
Are you sure you want to delete task 1: "Buy groceries"? (y/n): y

Task deleted successfully!
```

### 6. Exit the Application

```
Enter command (1-6): 6

Goodbye! All tasks have been cleared.
```

**Important**: All tasks are stored in memory only. When you exit, all data is lost.

## Common Use Cases

### Managing Multiple Tasks

```
# Add several tasks
1 → Add Task → "Buy groceries"
1 → Add Task → "Call dentist" → "Schedule annual checkup"
1 → Add Task → "Finish report"

# View all tasks
2 → View All Tasks

# Mark some complete
5 → Enter ID: 2 → Task marked as completed!

# View updated list
2 → View All Tasks
```

### Updating Task Information

**Update just the title**:
```
3 → Enter ID: 1 → Choice: 1 → New title: "Buy organic groceries"
```

**Update just the description**:
```
3 → Enter ID: 1 → Choice: 2 → New description: "At Whole Foods"
```

**Update both**:
```
3 → Enter ID: 1 → Choice: 3 → New title + New description
```

### Handling Errors

**Invalid task ID**:
```
Enter task ID: 99
Error: Task ID 99 not found.
(Returns to menu)
```

**Empty title**:
```
Enter task title:
Error: Task title is required.
(Returns to menu)
```

## Tips and Best Practices

### DO:
- ✅ Keep titles concise (under 200 characters)
- ✅ Use descriptions for additional context
- ✅ Mark tasks complete as you finish them
- ✅ Delete tasks you no longer need

### DON'T:
- ❌ Don't expect data to persist after exit
- ❌ Don't enter extremely long titles (200 char limit)
- ❌ Don't enter extremely long descriptions (1000 char limit)

## Troubleshooting

### Application won't start

**Problem**: `python: command not found`
**Solution**: Ensure Python 3.13+ is installed and in your PATH

**Problem**: `ModuleNotFoundError`
**Solution**: The application uses only standard library. Check Python version.

### Commands not working

**Problem**: "Invalid command" error
**Solution**: Enter numbers 1-6 only

**Problem**: "Task ID not found"
**Solution**: Use command 2 to view all tasks and their IDs

### Input issues

**Problem**: Title/description rejected
**Solution**: Check length limits (200 for title, 1000 for description)

## Limitations

- **No Persistence**: All tasks are lost when the application exits
- **Single Session**: Cannot save or load task lists
- **Single User**: No multi-user support
- **In-Memory Only**: No database or file storage
- **Terminal Only**: No GUI or web interface

## Example Session

```
$ python main.py

=== Todo Application ===
1. Add Task
2. View All Tasks
3. Update Task
4. Delete Task
5. Mark Task Complete/Incomplete
6. Exit

Enter command (1-6): 1
Enter task title: Buy groceries
Enter task description (optional, press Enter to skip):
Task added successfully!
Task ID: 1

Enter command (1-6): 1
Enter task title: Call dentist
Enter task description (optional, press Enter to skip): Schedule annual checkup
Task added successfully!
Task ID: 2

Enter command (1-6): 2

=== All Tasks ===

ID: 1
Title: Buy groceries
Description: (none)
Status: pending

ID: 2
Title: Call dentist
Description: Schedule annual checkup
Status: pending

Total: 2 tasks

Enter command (1-6): 5
Enter task ID to toggle status: 1
Current status: pending
Task marked as completed!

Enter command (1-6): 2

=== All Tasks ===

ID: 1
Title: Buy groceries
Description: (none)
Status: completed

ID: 2
Title: Call dentist
Description: Schedule annual checkup
Status: pending

Total: 2 tasks

Enter command (1-6): 6
Goodbye! All tasks have been cleared.
```

## Getting Help

For issues or questions:
1. Review this quickstart guide
2. Check the error messages (they provide specific guidance)
3. Ensure you're using Python 3.13 or higher
4. Verify you're entering valid commands (1-6)

## Next Steps

- Try all six commands to understand the workflow
- Experiment with updating and deleting tasks
- Practice toggling task completion status
- Remember: data is lost on exit (this is intentional for Phase I)
