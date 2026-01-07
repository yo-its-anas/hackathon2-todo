"""Command-line interface menu and handlers."""
from src.services import task_service
from src.services.task_service import ValidationError, TaskNotFoundError


def display_menu():
    """Display the main menu options."""
    print("\n=== Todo Application ===\n")
    print("1. Add Task")
    print("2. View All Tasks")
    print("3. Update Task")
    print("4. Delete Task")
    print("5. Mark Task Complete/Incomplete")
    print("6. Exit")


def get_user_input() -> str:
    """Prompt for and return user's command choice.

    Returns:
        User's input as string
    """
    return input("\nEnter command (1-6): ").strip()


def handle_add_task():
    """Handle adding a new task."""
    print()
    title = input("Enter task title: ")

    # Enforce 200 character limit for title
    if len(title.strip()) > 200:
        print("\nError: Task title must be 200 characters or less.")
        return

    description = input("Enter task description (optional, press Enter to skip): ")

    # Enforce 1000 character limit for description
    if len(description) > 1000:
        print("\nError: Task description must be 1000 characters or less.")
        return

    try:
        task = task_service.create_task(title, description)
        print(f"\nTask added successfully!")
        print(f"Task ID: {task.id}")
    except ValidationError as e:
        print(f"\nError: {e}")


def handle_view_tasks():
    """Handle viewing all tasks."""
    tasks = task_service.get_all_tasks()

    print("\n=== All Tasks ===\n")

    if not tasks:
        print("No tasks found. Use option 1 to add a task.")
    else:
        for task in tasks:
            print(f"ID: {task.id}")
            print(f"Title: {task.title}")
            print(f"Description: {task.description if task.description else '(none)'}")
            print(f"Status: {'completed' if task.is_completed else 'pending'}")
            print()

        print(f"Total: {len(tasks)} task{'s' if len(tasks) != 1 else ''}")


def handle_toggle_status():
    """Handle toggling task completion status."""
    print()
    task_id_input = input("Enter task ID to toggle: ").strip()

    try:
        task_id = int(task_id_input)

        # Get current task to show current status
        task = task_service.get_task_by_id(task_id)
        current_status = "completed" if task.is_completed else "pending"
        print(f"\nCurrent status: {current_status}")

        # Toggle the status
        updated_task = task_service.toggle_task_status(task_id)
        new_status = "completed" if updated_task.is_completed else "pending"

        print(f"Task {task_id} status changed to: {new_status}")
    except ValueError:
        print("\nError: Task ID must be a valid integer.")
    except TaskNotFoundError as e:
        print(f"\nError: {e}")


def handle_update_task():
    """Handle updating a task's title and/or description."""
    print()
    task_id_input = input("Enter task ID to update: ").strip()

    try:
        task_id = int(task_id_input)

        # Get current task to display current values
        task = task_service.get_task_by_id(task_id)
        print(f"\nCurrent title: {task.title}")
        print(f"Current description: {task.description if task.description else '(none)'}")

        # Ask what to update
        print("\nWhat would you like to update?")
        print("1. Title only")
        print("2. Description only")
        print("3. Both title and description")

        choice = input("\nEnter choice (1-3): ").strip()

        new_title = None
        new_description = None

        if choice == "1" or choice == "3":
            new_title = input("Enter new title: ")
            # Enforce 200 character limit for title
            if len(new_title.strip()) > 200:
                print("\nError: Task title must be 200 characters or less.")
                return

        if choice == "2" or choice == "3":
            new_description = input("Enter new description (press Enter to clear): ")
            # Enforce 1000 character limit for description
            if len(new_description) > 1000:
                print("\nError: Task description must be 1000 characters or less.")
                return

        if choice not in ["1", "2", "3"]:
            print("\nError: Invalid choice. Please enter 1, 2, or 3.")
            return

        # Update the task
        task_service.update_task(task_id, title=new_title, description=new_description)
        print(f"\nTask {task_id} updated successfully!")

    except ValueError:
        print("\nError: Task ID must be a valid integer.")
    except (TaskNotFoundError, ValidationError) as e:
        print(f"\nError: {e}")


def handle_delete_task():
    """Handle deleting a task."""
    print()
    task_id_input = input("Enter task ID to delete: ").strip()

    try:
        task_id = int(task_id_input)

        # Get task details to show user what they're deleting
        task = task_service.get_task_by_id(task_id)
        print(f"\nTask to delete:")
        print(f"ID: {task.id}")
        print(f"Title: {task.title}")
        print(f"Description: {task.description if task.description else '(none)'}")
        print(f"Status: {'completed' if task.is_completed else 'pending'}")

        # Ask for confirmation
        confirmation = input("\nAre you sure you want to delete this task? (y/n): ").strip().lower()

        if confirmation == 'y':
            task_service.delete_task(task_id)
            print(f"\nTask {task_id} deleted successfully!")
        else:
            print("\nDeletion cancelled.")

    except ValueError:
        print("\nError: Task ID must be a valid integer.")
    except TaskNotFoundError as e:
        print(f"\nError: {e}")


def run():
    """Main event loop for the CLI application."""
    while True:
        display_menu()
        choice = get_user_input()

        if choice == "1":
            handle_add_task()
        elif choice == "2":
            handle_view_tasks()
        elif choice == "3":
            handle_update_task()
        elif choice == "4":
            handle_delete_task()
        elif choice == "5":
            handle_toggle_status()
        elif choice == "6":
            print("\nGoodbye! All tasks have been cleared.")
            break
        else:
            print("\nInvalid command. Please enter 1-6.")
