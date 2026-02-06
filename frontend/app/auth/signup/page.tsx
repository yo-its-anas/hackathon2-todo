"use client"

/**
 * Sign Up Page (T030) - Animated Registration Form
 *
 * Features:
 * - Form entry animation
 * - Mobile-first responsive design
 * - Form validation with animated feedback
 * - Loading states
 * - Error messaging
 * - Password strength requirements
 */

import { authClient } from "@/lib/auth-client"
import { storeToken, clearToken } from "@/lib/token-manager"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "motion/react"
import { durations, easings } from "@/lib/motion-config"
import styles from "../auth.module.css"

export default function SignUpPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [name, setName] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [passwordValidation, setPasswordValidation] = useState<string[]>([])

  // Validate password strength
  const validatePassword = (pwd: string) => {
    const errors: string[] = []
    if (pwd.length < 8) {
      errors.push("At least 8 characters")
    }
    if (!/[A-Z]/.test(pwd)) {
      errors.push("One uppercase letter")
    }
    if (!/[a-z]/.test(pwd)) {
      errors.push("One lowercase letter")
    }
    if (!/[0-9]/.test(pwd)) {
      errors.push("One number")
    }
    return errors
  }

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPassword = e.target.value
    setPassword(newPassword)
    setPasswordValidation(validatePassword(newPassword))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    // Final password validation
    const passwordErrors = validatePassword(password)
    if (passwordErrors.length > 0) {
      setError(`Password must contain: ${passwordErrors.join(", ")}`)
      return
    }

    setLoading(true)

    try {
      // Clear any stale token before signup
      clearToken()

      const { data, error } = await authClient.signUp.email({
        email,
        password,
        name,
      })

      if (error) {
        setError(error.message || "Sign up failed")
        return
      }

      if (data) {
        // Get JWT token and store it for stateless API auth
        const { data: tokenData } = await authClient.token()
        if (tokenData?.token) {
          storeToken(tokenData.token, 86400) // 24 hours
        }

        // Notify navigation of auth state change
        window.dispatchEvent(new Event("auth-state-change"))
        // Redirect to tasks page on successful sign up
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
          Sign Up
        </motion.h1>

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
            <label htmlFor="name">Name</label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className={styles.formInput}
              autoComplete="name"
            />
          </motion.div>

          <motion.div
            className={styles.formGroup}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: durations.fast, delay: 0.3 }}
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
            transition={{ duration: durations.fast, delay: 0.35 }}
          >
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={handlePasswordChange}
              required
              minLength={8}
              className={styles.formInput}
              autoComplete="new-password"
            />
            <AnimatePresence>
              {password && passwordValidation.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: durations.fast }}
                  style={{
                    marginTop: "var(--spacing-xs)",
                    fontSize: "var(--font-size-sm)",
                    color: "var(--color-text-secondary)",
                    overflow: "hidden",
                  }}
                >
                  Password must contain: {passwordValidation.join(", ")}
                </motion.div>
              )}
            </AnimatePresence>
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
            transition={{ duration: durations.fast, delay: 0.4 }}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
          >
            {loading ? "Signing up..." : "Sign Up"}
          </motion.button>
        </motion.form>

        <motion.p
          className={styles.authFooter}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: durations.fast, delay: 0.45 }}
        >
          Already have an account?{" "}
          <a href="/auth/signin">Sign in</a>
        </motion.p>
      </motion.div>
    </motion.div>
  )
}
