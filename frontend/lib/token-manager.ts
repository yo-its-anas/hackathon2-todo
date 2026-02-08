/**
 * Token Manager - Stateless JWT Storage
 *
 * Stores JWT in localStorage to avoid cross-site cookie issues.
 * Token is retrieved once from Better Auth and cached until expiry.
 *
 * Flow:
 * 1. On login: Store token via storeToken()
 * 2. On API call: Get token via getToken()
 * 3. On logout/401: Clear token via clearToken()
 */

const TOKEN_KEY = "todo_app_jwt"
const TOKEN_EXPIRY_KEY = "todo_app_jwt_exp"

interface StoredToken {
  token: string
  expiresAt: number // Unix timestamp in ms
}

/**
 * Store JWT token in localStorage with expiry tracking.
 * @param token - JWT token string
 * @param expiresInSeconds - Token lifetime in seconds (default: 24 hours)
 */
export function storeToken(token: string, expiresInSeconds: number = 86400): void {
  if (typeof window === "undefined") return

  const expiresAt = Date.now() + expiresInSeconds * 1000
  localStorage.setItem(TOKEN_KEY, token)
  localStorage.setItem(TOKEN_EXPIRY_KEY, expiresAt.toString())
}

/**
 * Get stored token if valid (not expired).
 * Returns null if token is missing, expired, or invalid.
 */
export function getStoredToken(): string | null {
  if (typeof window === "undefined") return null

  const token = localStorage.getItem(TOKEN_KEY)
  const expiryStr = localStorage.getItem(TOKEN_EXPIRY_KEY)

  if (!token || !expiryStr) {
    return null
  }

  const expiresAt = parseInt(expiryStr, 10)

  // Check if token is expired (with 60s buffer for clock skew)
  if (Date.now() > expiresAt - 60000) {
    clearToken()
    return null
  }

  return token
}

/**
 * Clear stored token (on logout or auth failure).
 */
export function clearToken(): void {
  if (typeof window === "undefined") return

  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(TOKEN_EXPIRY_KEY)
}

/**
 * Check if a valid token exists.
 */
export function hasValidToken(): boolean {
  return getStoredToken() !== null
}
