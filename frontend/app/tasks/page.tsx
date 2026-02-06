"use client"

/**
 * Tasks Page - Complete Task Management UI with Animations
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
 * - Smooth animations for CRUD operations (T009-T016)
 */

import { useState, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "motion/react"
import { authClient } from "@/lib/auth-client"
import {
  getAllTasks,
  createTask,
  updateTask,
  toggleComplete,
  deleteTask,
  type Task,
} from "@/services/tasks"
import { durations, easings, variants, listItemTransition } from "@/lib/motion-config"
import LoadingSpinner from "@/components/LoadingSpinner"
import ErrorMessage from "@/components/ErrorMessage"
import EmptyState from "@/components/EmptyState"
import Toast from "@/components/Toast"
import ChatInterface from "@/components/chat/ChatInterface"
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

  // Toast state
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null)

  // Chat panel state
  const [isChatOpen, setIsChatOpen] = useState(false)

  const loadTasks = useCallback(async (uid: string) => {
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
  }, [])

  // Callback to refresh tasks after chat mutations (no loading spinner)
  const refreshTasks = useCallback(async () => {
    if (!userId) return
    try {
      const fetchedTasks = await getAllTasks(userId)
      const sortedTasks = fetchedTasks.sort((a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      )
      setTasks(sortedTasks)
    } catch (err) {
      console.error("Failed to refresh tasks:", err)
    }
  }, [userId])

  // Fetch session and load tasks on mount
  useEffect(() => {
    authClient.getSession().then((result) => {
      if (result.data?.user?.id) {
        setUserId(result.data.user.id)
        loadTasks(result.data.user.id)
      } else {
        window.location.href = "/auth/signin"
      }
      setSessionLoading(false)
    }).catch(() => {
      window.location.href = "/auth/signin"
      setSessionLoading(false)
    })
  }, [loadTasks])

  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ message, type })
  }, [])

  const handleToolSuccess = useCallback(({ tool, success }: { tool: string; success: boolean }) => {
    if (!success) return

    const toastMessages: Record<string, string> = {
      add_task: "Task created successfully!",
      delete_task: "Task deleted successfully!",
      complete_task: "Task marked as completed",
      update_task: "Task updated successfully!",
    }

    // Always refresh tasks after any tool execution to stay in sync
    refreshTasks()

    // Show toast only for mutation tools
    if (tool in toastMessages) {
      showToast(toastMessages[tool])
    }
  }, [refreshTasks, showToast])

  const hideToast = useCallback(() => {
    setToast(null)
  }, [])

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
      showToast("Task created successfully!")
    } catch (err) {
      setError("Failed to create task")
      showToast("Failed to create task", "error")
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
      showToast("Task updated successfully!")
    } catch (err) {
      setError("Failed to update task")
      showToast("Failed to update task", "error")
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
      showToast(updatedTask.is_completed ? "Task completed!" : "Task reopened!")
    } catch (err) {
      setError("Failed to toggle task")
      showToast("Failed to toggle task", "error")
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
      showToast("Task deleted successfully!")
    } catch (err) {
      setError("Failed to delete task")
      showToast("Failed to delete task", "error")
      console.error(err)
    } finally {
      setOperationLoading({ ...operationLoading, [`delete-${taskId}`]: false })
    }
  }

  if (sessionLoading || loading) {
    return <LoadingSpinner text="Loading tasks..." />
  }

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.container}>
      {/* Toast Notification */}
      <Toast
        message={toast?.message || ""}
        type={toast?.type || "success"}
        isVisible={!!toast}
        onClose={hideToast}
      />

      <motion.h1
        className={styles.pageHeading}
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: durations.base, ease: easings.easeOut }}
      >
        My Tasks
      </motion.h1>

      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: durations.fast }}
          >
            <ErrorMessage message={error} onRetry={() => userId && loadTasks(userId)} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Create Task Form */}
      <motion.form
        onSubmit={handleCreateTask}
        className={styles.createForm}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: durations.base, delay: 0.1, ease: easings.easeOut }}
      >
        <h2 className={styles.formHeading}>Create New Task</h2>

        <AnimatePresence>
          {validationError && (
            <motion.div
              className={styles.validationError}
              role="alert"
              initial={{ opacity: 0, height: 0, marginBottom: 0 }}
              animate={{ opacity: 1, height: "auto", marginBottom: "var(--spacing-md)" }}
              exit={{ opacity: 0, height: 0, marginBottom: 0 }}
              transition={{ duration: durations.fast }}
            >
              {validationError}
            </motion.div>
          )}
        </AnimatePresence>

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

        <motion.button
          type="submit"
          disabled={operationLoading.create}
          className={styles.submitButton}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          transition={{ duration: durations.micro }}
        >
          {operationLoading.create ? "Creating..." : "Add Task"}
        </motion.button>
      </motion.form>

      {/* Task List */}
      <motion.div
        className={styles.taskListSection}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: durations.base, delay: 0.2 }}
      >
        <h2 className={styles.sectionHeading}>
          All Tasks ({tasks.length})
        </h2>

        {tasks.length === 0 ? (
          <motion.div
            initial={variants.fadeIn.initial}
            animate={variants.fadeIn.animate}
            transition={{ duration: durations.base }}
          >
            <EmptyState
              icon="📝"
              title="No tasks yet"
              message="Start by creating your first task above to get organized!"
            />
          </motion.div>
        ) : (
          <ul className={styles.taskList} aria-live="polite">
            <AnimatePresence mode="popLayout">
              {tasks.map((task) => (
                <motion.li
                  key={task.id}
                  className={styles.taskItem}
                  layout
                  initial={listItemTransition.initial}
                  animate={listItemTransition.animate}
                  exit={listItemTransition.exit}
                  transition={{
                    ...listItemTransition.transition,
                    layout: { duration: durations.fast, ease: easings.easeInOut },
                  }}
                >
                  <AnimatePresence mode="wait">
                    {editingTaskId === task.id ? (
                      /* Edit Mode */
                      <motion.div
                        key="edit"
                        className={styles.editForm}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: durations.fast }}
                      >
                        <AnimatePresence>
                          {validationError && (
                            <motion.div
                              className={styles.validationError}
                              role="alert"
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              exit={{ opacity: 0, height: 0 }}
                              transition={{ duration: durations.fast }}
                            >
                              {validationError}
                            </motion.div>
                          )}
                        </AnimatePresence>

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
                          <motion.button
                            onClick={() => handleSaveEdit(task.id)}
                            disabled={operationLoading[`edit-${task.id}`]}
                            className={`${styles.actionButton} ${styles.saveButton}`}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            {operationLoading[`edit-${task.id}`] ? "Saving..." : "Save"}
                          </motion.button>
                          <motion.button
                            onClick={handleCancelEdit}
                            className={`${styles.actionButton} ${styles.cancelButton}`}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            Cancel
                          </motion.button>
                        </div>
                      </motion.div>
                    ) : deletingTaskId === task.id ? (
                      /* Delete Confirmation */
                      <motion.div
                        key="delete"
                        className={styles.deleteConfirmation}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: durations.fast }}
                      >
                        <p className={styles.deleteConfirmText}>
                          Are you sure you want to delete this task?
                        </p>
                        <p className={styles.deleteTaskTitle}>{task.title}</p>
                        <div className={styles.buttonGroup}>
                          <motion.button
                            onClick={() => handleConfirmDelete(task.id)}
                            disabled={operationLoading[`delete-${task.id}`]}
                            className={`${styles.actionButton} ${styles.deleteButton}`}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            {operationLoading[`delete-${task.id}`] ? "Deleting..." : "Yes, Delete"}
                          </motion.button>
                          <motion.button
                            onClick={handleCancelDelete}
                            className={`${styles.actionButton} ${styles.cancelButton}`}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            Cancel
                          </motion.button>
                        </div>
                      </motion.div>
                    ) : (
                      /* View Mode */
                      <motion.div
                        key="view"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: durations.fast }}
                      >
                        <motion.h3
                          className={`${styles.taskTitle} ${
                            task.is_completed ? styles.taskTitleCompleted : ""
                          }`}
                          animate={{
                            opacity: task.is_completed ? 0.7 : 1,
                          }}
                          transition={{ duration: durations.fast }}
                        >
                          <motion.span
                            initial={false}
                            animate={{
                              scale: task.is_completed ? [1, 1.2, 1] : 1,
                            }}
                            transition={{ duration: durations.fast }}
                          >
                            {task.is_completed ? "✓ " : "○ "}
                          </motion.span>
                          {task.title}
                        </motion.h3>

                        {task.description && (
                          <p className={styles.taskDescription}>{task.description}</p>
                        )}

                        <div className={styles.buttonGroup}>
                          <motion.button
                            onClick={() => handleToggleComplete(task.id)}
                            disabled={operationLoading[`toggle-${task.id}`]}
                            className={`${styles.actionButton} ${
                              task.is_completed ? styles.undoButton : styles.completeButton
                            }`}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            aria-label={task.is_completed ? "Mark as incomplete" : "Mark as complete"}
                          >
                            {operationLoading[`toggle-${task.id}`]
                              ? "..."
                              : task.is_completed
                              ? "Undo"
                              : "Complete"}
                          </motion.button>
                          <motion.button
                            onClick={() => handleEditClick(task)}
                            className={`${styles.actionButton} ${styles.editButton}`}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            aria-label="Edit task"
                          >
                            Edit
                          </motion.button>
                          <motion.button
                            onClick={() => handleDeleteClick(task.id)}
                            className={`${styles.actionButton} ${styles.deleteButton}`}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            aria-label="Delete task"
                          >
                            Delete
                          </motion.button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>
        )}
      </motion.div>
      </div>

      {/* Chat Toggle Button */}
      <motion.button
        className={styles.chatToggle}
        onClick={() => setIsChatOpen(!isChatOpen)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        aria-label={isChatOpen ? "Close chat" : "Open chat assistant"}
      >
        {isChatOpen ? "✕" : "💬"}
      </motion.button>

      {/* Chat Panel */}
      <AnimatePresence>
        {isChatOpen && userId && (
          <motion.div
            className={styles.chatPanel}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: durations.fast, ease: easings.easeOut }}
          >
            <div className={styles.chatHeader}>
              <span>Task Assistant</span>
              <button
                className={styles.chatCloseBtn}
                onClick={() => setIsChatOpen(false)}
                aria-label="Close chat"
              >
                ✕
              </button>
            </div>
            <ChatInterface userId={userId} onTaskChange={refreshTasks} onToolSuccess={handleToolSuccess} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
