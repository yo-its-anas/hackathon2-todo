/**
 * Better Auth Server Configuration
 *
 * Configures Better Auth with JWT plugin for token-based authentication.
 * This configuration runs on the server side and issues JWTs to authenticated users.
 */
import { betterAuth } from "better-auth"
import { jwt } from "better-auth/plugins"
import { Pool } from "pg"

// Determine if running in production (Vercel sets NODE_ENV=production)
const isProduction = process.env.NODE_ENV === "production"

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

  // Trust the host header from Vercel's proxy
  trustedOrigins: [
    process.env.BETTER_AUTH_URL || "http://localhost:3000",
    process.env.NEXT_PUBLIC_BETTER_AUTH_URL || "http://localhost:3000",
  ],

  // Session cookie configuration for cross-origin and production
  advanced: {
    cookiePrefix: "todo_app",
    useSecureCookies: isProduction,
    // Required for Vercel deployment behind proxy
    generateId: () => crypto.randomUUID(),
  },

  // Session configuration - server-side session expiry
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days (server-side session lifetime)
    updateAge: 60 * 60 * 24, // Refresh session if older than 1 day
    cookieCache: {
      enabled: true,
      maxAge: 60 * 60 * 24, // 24 hours client-side cache
    },
  },
})
