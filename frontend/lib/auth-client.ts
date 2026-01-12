/**
 * Better Auth Client Configuration
 *
 * Client-side authentication utilities for interacting with Better Auth
 * from React components. Includes JWT plugin for token retrieval.
 */
import { createAuthClient } from "better-auth/client"
import { jwtClient } from "better-auth/client/plugins"

export const authClient = createAuthClient({
  // Base URL for Better Auth API endpoints
  baseURL: process.env.NEXT_PUBLIC_BETTER_AUTH_URL || "http://localhost:3000",

  // JWT Client Plugin for token retrieval
  plugins: [jwtClient()],
})
