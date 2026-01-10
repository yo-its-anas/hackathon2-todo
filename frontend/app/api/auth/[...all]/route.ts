/**
 * Better Auth API Route Handler
 *
 * Catch-all route that handles all Better Auth authentication requests
 * including sign-up, sign-in, sign-out, and JWT token issuance.
 *
 * Route: /api/auth/*
 */
import { auth } from "@/lib/auth"

// Force Node.js runtime for Neon Postgres compatibility
export const runtime = "nodejs"

export const GET = auth.handler
export const POST = auth.handler
