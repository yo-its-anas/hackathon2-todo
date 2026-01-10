"use client"

/**
 * Tasks Page - Complete Task Management UI
 *
 * Features:
 * - Create, view, edit, delete, toggle completion
 * - Form validation (title required, max 255 chars)
 * - Delete confirmation dialog
 * - Loading states for all operations
 * - Empty state when no tasks
 * - Inline error messages
 * - Reverse chronological order (newest first)
 * - Responsive CSS modules styling
 */

import { useState, useEffect } from "react"
import { authClient } from "@/lib/auth-client"
import {
  getAllTasks,
  createTask,
  updateTask,
  toggleComplete,
  deleteTask,
  type Task,
} from "@/services/tasks"
import LoadingSpinner from "@/components/LoadingSpinner"
import ErrorMessage from "@/components/ErrorMessage"
import EmptyState from "@/components/EmptyState"
import styles from "./tasks.module.css"

export default function TasksPage() {
  // Data state
  const [tasks, setTasks] = useState<Task[]>([])
  const [userId, setUserId] = useState<string | null>(null)

  // Form state (create)
  const [newTaskTitle, setNewTaskTitle] = useState("")
  const [newTaskDescription, setNewTaskDescription] = useState("")

  // Form state (edit)
  const [editingTaskId, setEditingTaskId] = useState<number | null>(null)
  const [editTitle, setEditTitle] = useState("")
  const [editDescription, setEditDescription] = useState("")

  // UI state
  const [loading, setLoading] = useState(true)
  const [sessionLoading, setSessionLoading] = useState(true)
  const [operationLoading, setOperationLoading] = useState<Record<string, boolean>>({})
  const [error, setError] = useState("")
  const [validationError, setValidationError] = useState("")
  const [deletingTaskId, setDeletingTaskId] = useState<number | null>(null)
  const [successMessage, setSuccessMessage] = useState("")

  useEffect(() => {
    // Fetch session using async getSession method
    authClient.getSession().then((result) => {
      if (result.data?.user?.id) {
        setUserId(result.data.user.id)
        loadTasks(result.data.user.id)
      } else {
        // Redirect to sign-in if not authenticated
        window.location.href = "/auth/signin"
      }
      setSessionLoading(false)
    }).catch(() => {
      window.location.href = "/auth/signin"
      setSessionLoading(false)
    })
  }, [])

  const loadTasks = async (uid: string) => {
    try {
      setLoading(true)
      const fetchedTasks = await getAllTasks(uid)
      // Sort by created_at descending (newest first)
      const sortedTasks = fetchedTasks.sort((a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      )
      setTasks(sortedTasks)
      setError("")
    } catch (err) {
      setError("Failed to load tasks")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const showSuccess = (message: string) => {
    setSuccessMessage(message)
    setTimeout(() => setSuccessMessage(""), 3000)
  }

  const validateTaskTitle = (title: string): string | null => {
    const trimmed = title.trim()
    if (!trimmed) {
      return "Task title is required"
    }
    if (trimmed.length > 255) {
      return "Task title must be 255 characters or less"
    }
    return null
  }

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!userId) return

    // Validation
    const titleError = validateTaskTitle(newTaskTitle)
    if (titleError) {
      setValidationError(titleError)
      return
    }

    setOperationLoading({ ...operationLoading, create: true })
    setValidationError("")

    try {
      const newTask = await createTask(userId, {
        title: newTaskTitle.trim(),
        description: newTaskDescription.trim() || null,
      })
      setTasks([newTask, ...tasks]) // Add to front (newest first)
      setNewTaskTitle("")
      setNewTaskDescription("")
      setError("")
      showSuccess("Task created successfully!")
    } catch (err) {
      setError("Failed to create task")
      console.error(err)
    } finally {
      setOperationLoading({ ...operationLoading, create: false })
    }
  }

  const handleEditClick = (task: Task) => {
    setEditingTaskId(task.id)
    setEditTitle(task.title)
    setEditDescription(task.description || "")
    setValidationError("")
  }

  const handleCancelEdit = () => {
    setEditingTaskId(null)
    setEditTitle("")
    setEditDescription("")
    setValidationError("")
  }

  const handleSaveEdit = async (taskId: number) => {
    if (!userId) return

    // Validation
    const titleError = validateTaskTitle(editTitle)
    if (titleError) {
      setValidationError(titleError)
      return
    }

    setOperationLoading({ ...operationLoading, [`edit-${taskId}`]: true })
    setValidationError("")

    try {
      const updatedTask = await updateTask(userId, taskId, {
        title: editTitle.trim(),
        description: editDescription.trim() || null,
      })
      setTasks(tasks.map((t) => (t.id === taskId ? updatedTask : t)))
      setEditingTaskId(null)
      setEditTitle("")
      setEditDescription("")
      setError("")
      showSuccess("Task updated successfully!")
    } catch (err) {
      setError("Failed to update task")
      console.error(err)
    } finally {
      setOperationLoading({ ...operationLoading, [`edit-${taskId}`]: false })
    }
  }

  const handleToggleComplete = async (taskId: number) => {
    if (!userId) return

    setOperationLoading({ ...operationLoading, [`toggle-${taskId}`]: true })

    try {
      const updatedTask = await toggleComplete(userId, taskId)
      setTasks(tasks.map((t) => (t.id === taskId ? updatedTask : t)))
      setError("")
      showSuccess(updatedTask.is_completed ? "Task completed!" : "Task reopened!")
    } catch (err) {
      setError("Failed to toggle task")
      console.error(err)
    } finally {
      setOperationLoading({ ...operationLoading, [`toggle-${taskId}`]: false })
    }
  }

  const handleDeleteClick = (taskId: number) => {
    setDeletingTaskId(taskId)
  }

  const handleCancelDelete = () => {
    setDeletingTaskId(null)
  }

  const handleConfirmDelete = async (taskId: number) => {
    if (!userId) return

    setOperationLoading({ ...operationLoading, [`delete-${taskId}`]: true })

    try {
      await deleteTask(userId, taskId)
      setTasks(tasks.filter((t) => t.id !== taskId))
      setDeletingTaskId(null)
      setError("")
      showSuccess("Task deleted successfully!")
    } catch (err) {
      setError("Failed to delete task")
      console.error(err)
    } finally {
      setOperationLoading({ ...operationLoading, [`delete-${taskId}`]: false })
    }
  }

  if (sessionLoading || loading) {
    return <LoadingSpinner text="Loading tasks..." />
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.pageHeading}>My Tasks</h1>

      {error && <ErrorMessage message={error} onRetry={() => userId && loadTasks(userId)} />}
      {successMessage && (
        <div className={styles.successMessage} role="status" aria-live="polite">
          ✓ {successMessage}
        </div>
      )}

      {/* Create Task Form */}
      <form onSubmit={handleCreateTask} className={styles.createForm}>
        <h2 className={styles.formHeading}>Create New Task</h2>

        {validationError && (
          <div className={styles.validationError} role="alert">
            {validationError}
          </div>
        )}

        <div className={styles.formGroup}>
          <label htmlFor="new-task-title" className={styles.formLabel}>
            Title <span className={styles.required}>*</span>
          </label>
          <input
            id="new-task-title"
            type="text"
            placeholder="Enter task title"
            value={newTaskTitle}
            onChange={(e) => {
              setNewTaskTitle(e.target.value)
              setValidationError("")
            }}
            required
            maxLength={255}
            className={styles.formInput}
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="new-task-description" className={styles.formLabel}>
            Description (optional)
          </label>
          <textarea
            id="new-task-description"
            placeholder="Add details about this task"
            value={newTaskDescription}
            onChange={(e) => setNewTaskDescription(e.target.value)}
            rows={3}
            className={styles.formTextarea}
          />
        </div>

        <button
          type="submit"
          disabled={operationLoading.create}
          className={styles.submitButton}
        >
          {operationLoading.create ? "Creating..." : "Add Task"}
        </button>
      </form>

      {/* Task List */}
      <div className={styles.taskListSection}>
        <h2 className={styles.sectionHeading}>
          All Tasks ({tasks.length})
        </h2>

        {tasks.length === 0 ? (
          <EmptyState
            icon="📝"
            title="No tasks yet"
            message="Start by creating your first task above to get organized!"
          />
        ) : (
          <ul className={styles.taskList}>
            {tasks.map((task) => (
              <li key={task.id} className={styles.taskItem}>
                {editingTaskId === task.id ? (
                  /* Edit Mode */
                  <div className={styles.editForm}>
                    {validationError && (
                      <div className={styles.validationError} role="alert">
                        {validationError}
                      </div>
                    )}

                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>
                        Title <span className={styles.required}>*</span>
                      </label>
                      <input
                        type="text"
                        value={editTitle}
                        onChange={(e) => {
                          setEditTitle(e.target.value)
                          setValidationError("")
                        }}
                        maxLength={255}
                        className={styles.formInput}
                      />
                    </div>

                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>Description</label>
                      <textarea
                        value={editDescription}
                        onChange={(e) => setEditDescription(e.target.value)}
                        rows={3}
                        className={styles.formTextarea}
                      />
                    </div>

                    <div className={styles.buttonGroup}>
                      <button
                        onClick={() => handleSaveEdit(task.id)}
                        disabled={operationLoading[`edit-${task.id}`]}
                        className={`${styles.actionButton} ${styles.saveButton}`}
                      >
                        {operationLoading[`edit-${task.id}`] ? "Saving..." : "Save"}
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        className={`${styles.actionButton} ${styles.cancelButton}`}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : deletingTaskId === task.id ? (
                  /* Delete Confirmation */
                  <div className={styles.deleteConfirmation}>
                    <p className={styles.deleteConfirmText}>
                      Are you sure you want to delete this task?
                    </p>
                    <p className={styles.deleteTaskTitle}>{task.title}</p>
                    <div className={styles.buttonGroup}>
                      <button
                        onClick={() => handleConfirmDelete(task.id)}
                        disabled={operationLoading[`delete-${task.id}`]}
                        className={`${styles.actionButton} ${styles.deleteButton}`}
                      >
                        {operationLoading[`delete-${task.id}`] ? "Deleting..." : "Yes, Delete"}
                      </button>
                      <button
                        onClick={handleCancelDelete}
                        className={`${styles.actionButton} ${styles.cancelButton}`}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  /* View Mode */
                  <div>
                    <h3
                      className={`${styles.taskTitle} ${
                        task.is_completed ? styles.taskTitleCompleted : ""
                      }`}
                    >
                      {task.is_completed ? "✓ " : "○ "}
                      {task.title}
                    </h3>

                    {task.description && (
                      <p className={styles.taskDescription}>{task.description}</p>
                    )}

                    <div className={styles.buttonGroup}>
                      <button
                        onClick={() => handleToggleComplete(task.id)}
                        disabled={operationLoading[`toggle-${task.id}`]}
                        className={`${styles.actionButton} ${
                          task.is_completed ? styles.undoButton : styles.completeButton
                        }`}
                      >
                        {operationLoading[`toggle-${task.id}`]
                          ? "..."
                          : task.is_completed
                          ? "Undo"
                          : "Complete"}
                      </button>
                      <button
                        onClick={() => handleEditClick(task)}
                        className={`${styles.actionButton} ${styles.editButton}`}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteClick(task.id)}
                        className={`${styles.actionButton} ${styles.deleteButton}`}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
