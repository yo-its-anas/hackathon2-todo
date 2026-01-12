/**
 * Better Auth Server Configuration
 *
 * Configures Better Auth with JWT plugin for token-based authentication.
 * This configuration runs on the server side and issues JWTs to authenticated users.
 */
import { betterAuth } from "better-auth"
import { jwt } from "better-auth/plugins"
import { Pool } from "pg"

export const auth = betterAuth({
  // Database connection using pg Pool (required for Better Auth)
  database: new Pool({
    connectionString: process.env.DATABASE_URL,
  }),

  // Enable email/password authentication
  emailAndPassword: {
    enabled: true,
  },

  // JWT Plugin Configuration
  plugins: [
    jwt({
      jwt: {
        // 24-hour token expiry
        expirationTime: "24h",
      },
    }),
  ],

  // Shared secret for JWT signing (must match backend BETTER_AUTH_SECRET)
  secret: process.env.BETTER_AUTH_SECRET || "",

  // Base URL for authentication endpoints
  baseURL: process.env.BETTER_AUTH_URL || "http://localhost:3000",
})
