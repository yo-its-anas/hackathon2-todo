"use client"

/**
 * Sign Up Page - Responsive Registration Form
 *
 * Features:
 * - Mobile-first responsive design
 * - Form validation
 * - Loading states
 * - Error messaging
 * - Password strength requirements
 */

import { authClient } from "@/lib/auth-client"
import { useState } from "react"
import { useRouter } from "next/navigation"
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
    <div className={styles.authContainer}>
      <div className={styles.authCard}>
        <h1 className={styles.authHeading}>Sign Up</h1>

        <form onSubmit={handleSubmit} className={styles.authForm}>
          <div className={styles.formGroup}>
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
          </div>

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
              onChange={handlePasswordChange}
              required
              minLength={8}
              className={styles.formInput}
              autoComplete="new-password"
            />
            {password && passwordValidation.length > 0 && (
              <div
                style={{
                  marginTop: "var(--spacing-xs)",
                  fontSize: "var(--font-size-sm)",
                  color: "var(--color-text-secondary)",
                }}
              >
                Password must contain: {passwordValidation.join(", ")}
              </div>
            )}
          </div>

          {error && (
            <div className={styles.errorMessage}>{error}</div>
          )}

          <button
            type="submit"
            disabled={loading}
            className={`${styles.submitButton} ${loading ? styles.loading : ""}`}
          >
            {loading ? "Signing up..." : "Sign Up"}
          </button>
        </form>

        <p className={styles.authFooter}>
          Already have an account?{" "}
          <a href="/auth/signin">Sign in</a>
        </p>
      </div>
    </div>
  )
}
