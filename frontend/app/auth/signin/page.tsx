"use client"

/**
 * Sign In Page - Responsive Authentication Form
 *
 * Features:
 * - Mobile-first responsive design
 * - Session expiry handling
 * - Form validation
 * - Loading states
 * - Error messaging
 */

import { authClient } from "@/lib/auth-client"
import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import styles from "../auth.module.css"

function SignInForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [sessionExpiredMessage, setSessionExpiredMessage] = useState("")

  // Check for session expiry on mount - T052
  useEffect(() => {
    const expired = searchParams.get("expired")
    const sessionExpired = sessionStorage.getItem("sessionExpired")

    if (expired === "true" || sessionExpired === "true") {
      setSessionExpiredMessage("Your session has expired. Please sign in again.")
      sessionStorage.removeItem("sessionExpired")
    }
  }, [searchParams])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const { data, error } = await authClient.signIn.email({
        email,
        password,
      })

      if (error) {
        setError(error.message || "Sign in failed")
        return
      }

      if (data) {
        // Redirect to tasks page on successful sign in
        router.push("/tasks")
      }
    } catch (err) {
      setError("An unexpected error occurred")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.authContainer}>
      <div className={styles.authCard}>
        <h1 className={styles.authHeading}>Sign In</h1>

        {sessionExpiredMessage && (
          <div className={styles.warningMessage} role="alert" aria-live="assertive">
            {sessionExpiredMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className={styles.authForm}>
          <div className={styles.formGroup}>
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className={styles.formInput}
              autoComplete="email"
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className={styles.formInput}
              autoComplete="current-password"
            />
          </div>

          {error && (
            <div className={styles.errorMessage} role="alert" aria-live="assertive">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className={`${styles.submitButton} ${loading ? styles.loading : ""}`}
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <p className={styles.authFooter}>
          Don&apos;t have an account?{" "}
          <a href="/auth/signup">Sign up</a>
        </p>
      </div>
    </div>
  )
}

export default function SignInPage() {
  return (
    <Suspense fallback={<div className={styles.authContainer}><div className={styles.authCard}>Loading...</div></div>}>
      <SignInForm />
    </Suspense>
  )
}
