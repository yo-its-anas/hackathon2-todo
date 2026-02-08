/**
 * Task Service - Authenticated API methods for task operations
 *
 * All methods use the authenticatedFetch wrapper to automatically:
 * - Attach JWT tokens
 * - Handle 401 errors (redirect to sign-in)
 * - Handle all HTTP errors with user-friendly messages
 * - Include proper headers
 * - Reject SSR calls with controlled error
 */
import { authenticatedFetch, ApiError, isSSRError } from "@/lib/api-client"

export interface Task {
  id: number
  title: string
  description: string | null
  is_completed: boolean
  user_id: string
  created_at: string
  updated_at: string
}

export interface TaskCreate {
  title: string
  description?: string | null
}

export interface TaskUpdate {
  title?: string
  description?: string | null
  is_completed?: boolean
}

/**
 * Get all tasks for the authenticated user.
 * T063, T068 - User-friendly error messages
 */
export async function getAllTasks(userId: string): Promise<Task[]> {
  try {
    const response = await authenticatedFetch(`/api/${userId}/tasks`)
    return response.json()
  } catch (error) {
    // SSR errors should bubble up with clear message
    if (isSSRError(error)) {
      throw new Error("API calls require browser context")
    }
    if (error instanceof ApiError) {
      // Re-throw with user-friendly message
      throw new Error(error.userMessage)
    }
    // Network error or other unexpected error - T068
    throw new Error("Unable to load tasks. Please check your connection and try again.")
  }
}

/**
 * Get a single task by ID for the authenticated user.
 */
export async function getTaskById(userId: string, taskId: number): Promise<Task> {
  try {
    const response = await authenticatedFetch(`/api/${userId}/tasks/${taskId}`)
    return response.json()
  } catch (error) {
    if (error instanceof ApiError) {
      throw new Error(error.userMessage)
    }
    throw new Error("Unable to load task. Please check your connection and try again.")
  }
}

/**
 * Create a new task for the authenticated user.
 * T068 - User-friendly error messages
 */
export async function createTask(
  userId: string,
  taskData: TaskCreate
): Promise<Task> {
  try {
    const response = await authenticatedFetch(`/api/${userId}/tasks`, {
      method: "POST",
      body: JSON.stringify(taskData),
    })
    return response.json()
  } catch (error) {
    if (error instanceof ApiError) {
      throw new Error(error.userMessage)
    }
    throw new Error("Unable to create task. Please check your connection and try again.")
  }
}

/**
 * Update an existing task.
 * T068 - User-friendly error messages
 */
export async function updateTask(
  userId: string,
  taskId: number,
  taskData: TaskUpdate
): Promise<Task> {
  try {
    const response = await authenticatedFetch(`/api/${userId}/tasks/${taskId}`, {
      method: "PUT",
      body: JSON.stringify(taskData),
    })
    return response.json()
  } catch (error) {
    if (error instanceof ApiError) {
      throw new Error(error.userMessage)
    }
    throw new Error("Unable to update task. Please check your connection and try again.")
  }
}

/**
 * Toggle task completion status.
 * T068 - User-friendly error messages
 */
export async function toggleComplete(
  userId: string,
  taskId: number
): Promise<Task> {
  try {
    const response = await authenticatedFetch(
      `/api/${userId}/tasks/${taskId}/complete`,
      {
        method: "PATCH",
      }
    )
    return response.json()
  } catch (error) {
    if (error instanceof ApiError) {
      throw new Error(error.userMessage)
    }
    throw new Error("Unable to update task status. Please check your connection and try again.")
  }
}

/**
 * Delete a task.
 * T068 - User-friendly error messages
 */
export async function deleteTask(userId: string, taskId: number): Promise<void> {
  try {
    await authenticatedFetch(`/api/${userId}/tasks/${taskId}`, {
      method: "DELETE",
    })
  } catch (error) {
    if (error instanceof ApiError) {
      throw new Error(error.userMessage)
    }
    throw new Error("Unable to delete task. Please check your connection and try again.")
  }
}
