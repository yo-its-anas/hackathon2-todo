/**
 * API Client with JWT Authentication and Comprehensive Error Handling
 *
 * Fetch wrapper that:
 * - Uses cached JWT from localStorage (stateless, no cookies to backend)
 * - Falls back to Better Auth token retrieval if cache is empty
 * - Handles 401 responses by clearing token and redirecting
 * - Provides centralized error handling with user-friendly messages
 * - Handles network errors (offline, timeout, connection issues)
 * - Includes retry logic for transient failures
 */
import { authClient } from "@/lib/auth-client"
import { getStoredToken, storeToken, clearToken } from "@/lib/token-manager"

/**
 * Custom error class for API errors with user-friendly messages
 */
export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public userMessage: string,
    public isNetworkError: boolean = false
  ) {
    super(message)
    this.name = "ApiError"
  }
}

/**
 * Check if the browser is online
 */
function isOnline(): boolean {
  return typeof navigator !== "undefined" ? navigator.onLine : true
}

/**
 * Make an authenticated API request to the backend with retry logic.
 *
 * Automatically:
 * - Retrieves JWT from Better Auth
 * - Attaches Authorization: Bearer header
 * - Redirects to sign-in on 401 (expired/invalid token)
 * - Handles network errors (offline, timeout)
 * - Retries transient failures (network errors, 500s)
 *
 * @param url - Backend API endpoint (relative or absolute)
 * @param options - Fetch options (method, body, headers, etc.)
 * @param retryCount - Number of retry attempts for transient failures (default: 2)
 * @param timeoutMs - Request timeout in milliseconds (default: 10000)
 * @returns Response object
 * @throws ApiError for HTTP errors and network failures
 */
export async function authenticatedFetch(
  url: string,
  options: RequestInit = {},
  retryCount: number = 2,
  timeoutMs: number = 10000
): Promise<Response> {
  // Check if offline
  if (!isOnline()) {
    throw new ApiError(
      "Network offline",
      0,
      "You appear to be offline. Please check your internet connection and try again.",
      true
    )
  }

  // Try cached token first (stateless - no cookie dependency)
  let token = getStoredToken()

  // If no cached token, try to get from Better Auth and cache it
  if (!token) {
    const { data: tokenData, error: tokenError } = await authClient.token()

    if (tokenError || !tokenData?.token) {
      // Token retrieval failed - redirect to sign-in
      clearToken()
      if (typeof window !== "undefined") {
        window.location.href = "/auth/signin"
      }
      throw new ApiError("Authentication required", 401, "Authentication required", false)
    }

    // Cache the token (24 hours = 86400 seconds)
    token = tokenData.token
    storeToken(token, 86400)
  }

  // Build full URL if relative path provided
  const baseURL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"
  const fullURL = url.startsWith("http") ? url : `${baseURL}${url}`

  // Attach Authorization header with JWT (stateless - no cookies needed)
  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
    ...options.headers,
  }

  // Create abort controller for timeout
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs)

  try {
    // Make API request with timeout (stateless JWT auth - no cookies)
    const response = await fetch(fullURL, {
      ...options,
      headers,
      signal: controller.signal,
    })

    clearTimeout(timeoutId)

    // Handle specific HTTP error codes with user-friendly messages
    if (!response.ok) {
      // 401 Unauthorized (expired/invalid token)
      if (response.status === 401) {
        // Clear cached token on auth failure
        clearToken()
        if (typeof window !== "undefined") {
          // Set session expiry flag for signin page to display message
          sessionStorage.setItem("sessionExpired", "true")
          window.location.href = "/auth/signin?expired=true"
        }
        throw new ApiError(
          "Token expired or invalid",
          401,
          "Your session has expired. Please sign in again.",
          false
        )
      }

      // 403 Forbidden (access denied)
      if (response.status === 403) {
        throw new ApiError(
          "Access forbidden",
          403,
          "You don't have permission to access this resource.",
          false
        )
      }

      // 404 Not Found
      if (response.status === 404) {
        throw new ApiError(
          "Resource not found",
          404,
          "The requested resource was not found. It may have been deleted.",
          false
        )
      }

      // 422 Validation Error
      if (response.status === 422) {
        let errorDetail = "Please check your input and try again."
        try {
          const errorData = await response.json()
          if (errorData.detail) {
            errorDetail =
              typeof errorData.detail === "string"
                ? errorData.detail
                : JSON.stringify(errorData.detail)
          }
        } catch {
          // If parsing fails, use default message
        }
        throw new ApiError(
          "Validation error",
          422,
          `Validation failed: ${errorDetail}`,
          false
        )
      }

      // 500 Server Error - Retry if retries remaining
      if (response.status >= 500) {
        if (retryCount > 0) {
          // Wait before retrying (exponential backoff)
          const waitMs = (3 - retryCount) * 1000
          await new Promise((resolve) => setTimeout(resolve, waitMs))
          return authenticatedFetch(url, options, retryCount - 1, timeoutMs)
        }

        throw new ApiError(
          "Server error",
          response.status,
          "Something went wrong on our end. Please try again in a moment.",
          false
        )
      }

      // Generic error for other status codes
      throw new ApiError(
        `HTTP error ${response.status}`,
        response.status,
        "An unexpected error occurred. Please try again.",
        false
      )
    }

    return response
  } catch (error) {
    clearTimeout(timeoutId)

    // Handle abort (timeout)
    if (error instanceof Error && error.name === "AbortError") {
      throw new ApiError(
        "Request timeout",
        0,
        "The request took too long. Please check your connection and try again.",
        true
      )
    }

    // Handle network errors (connection failed, DNS error, etc.)
    if (error instanceof TypeError) {
      // Check if we should retry
      if (retryCount > 0) {
        // Wait before retrying
        const waitMs = (3 - retryCount) * 1000
        await new Promise((resolve) => setTimeout(resolve, waitMs))
        return authenticatedFetch(url, options, retryCount - 1, timeoutMs)
      }

      throw new ApiError(
        "Network error",
        0,
        "Unable to connect to the server. Please check your internet connection and try again.",
        true
      )
    }

    // Re-throw ApiError instances
    if (error instanceof ApiError) {
      throw error
    }

    // Unknown error
    throw new ApiError(
      "Unknown error",
      0,
      "An unexpected error occurred. Please try again.",
      true
    )
  }
}

/**
 * Helper function to handle API errors and extract user-friendly messages
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    return error.userMessage
  }
  if (error instanceof Error) {
    return error.message
  }
  return "An unexpected error occurred"
}

/**
 * Helper function to check if an error is a network error
 */
export function isNetworkError(error: unknown): boolean {
  if (error instanceof ApiError) {
    return error.isNetworkError
  }
  return false
}
