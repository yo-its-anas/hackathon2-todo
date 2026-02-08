"use client"

/**
 * Sign In Page (T029) - Animated Authentication Form
 *
 * Features:
 * - Form entry animation
 * - Mobile-first responsive design
 * - Session expiry handling
 * - Form validation
 * - Loading states
 * - Error messaging with animations
 */

import { authClient } from "@/lib/auth-client"
import { storeToken, clearToken } from "@/lib/token-manager"
import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { motion, AnimatePresence } from "motion/react"
import { durations, easings } from "@/lib/motion-config"
import styles from "../auth.module.css"

function SignInForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [sessionExpiredMessage, setSessionExpiredMessage] = useState("")

  // Check for session expiry on mount
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
      // Clear any stale token before login
      clearToken()

      const { data, error } = await authClient.signIn.email({
        email,
        password,
      })

      if (error) {
        setError(error.message || "Sign in failed")
        return
      }

      if (data) {
        // Get JWT token and store it for stateless API auth
        // Retry up to 3 times with delay to handle session initialization race
        let tokenStored = false
        for (let attempt = 0; attempt < 3 && !tokenStored; attempt++) {
          if (attempt > 0) {
            await new Promise(r => setTimeout(r, 300))
          }
          const { data: tokenData } = await authClient.token()
          if (tokenData?.token) {
            storeToken(tokenData.token, 86400) // 24 hours
            tokenStored = true
          }
        }

        if (!tokenStored) {
          setError("Failed to initialize session. Please try again.")
          return
        }

        // Notify navigation of auth state change
        window.dispatchEvent(new Event("auth-state-change"))
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
    <motion.div
      className={styles.authContainer}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: durations.base }}
    >
      <motion.div
        className={styles.authCard}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: durations.base, delay: 0.1, ease: easings.easeOut }}
      >
        <motion.h1
          className={styles.authHeading}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: durations.fast, delay: 0.15 }}
        >
          Sign In
        </motion.h1>

        <AnimatePresence>
          {sessionExpiredMessage && (
            <motion.div
              className={styles.warningMessage}
              role="alert"
              aria-live="assertive"
              initial={{ opacity: 0, height: 0, marginBottom: 0 }}
              animate={{ opacity: 1, height: "auto", marginBottom: "var(--spacing-md)" }}
              exit={{ opacity: 0, height: 0, marginBottom: 0 }}
              transition={{ duration: durations.fast }}
            >
              {sessionExpiredMessage}
            </motion.div>
          )}
        </AnimatePresence>

        <motion.form
          onSubmit={handleSubmit}
          className={styles.authForm}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: durations.fast, delay: 0.2 }}
        >
          <motion.div
            className={styles.formGroup}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: durations.fast, delay: 0.25 }}
          >
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
          </motion.div>

          <motion.div
            className={styles.formGroup}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: durations.fast, delay: 0.3 }}
          >
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
          </motion.div>

          <AnimatePresence>
            {error && (
              <motion.div
                className={styles.errorMessage}
                role="alert"
                aria-live="assertive"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: durations.fast }}
              >
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          <motion.button
            type="submit"
            disabled={loading}
            className={`${styles.submitButton} ${loading ? styles.loading : ""}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: durations.fast, delay: 0.35 }}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
          >
            {loading ? "Signing in..." : "Sign In"}
          </motion.button>
        </motion.form>

        <motion.p
          className={styles.authFooter}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: durations.fast, delay: 0.4 }}
        >
          Don&apos;t have an account?{" "}
          <a href="/auth/signup">Sign up</a>
        </motion.p>
      </motion.div>
    </motion.div>
  )
}

export default function SignInPage() {
  return (
    <Suspense fallback={
      <div className={styles.authContainer}>
        <div className={styles.authCard}>Loading...</div>
      </div>
    }>
      <SignInForm />
    </Suspense>
  )
}
