"use client"

/**
 * Sign Out Page
 *
 * Handles user sign-out by:
 * 1. Calling Better Auth signOut method
 * 2. Clearing session data
 * 3. Redirecting to sign-in page
 */

import { useEffect } from "react"
import { authClient } from "@/lib/auth-client"
import { clearToken } from "@/lib/token-manager"
import { useRouter } from "next/navigation"
import LoadingSpinner from "@/components/LoadingSpinner"

export default function SignOutPage() {
  const router = useRouter()

  useEffect(() => {
    const handleSignOut = async () => {
      try {
        // Clear cached JWT token first (stateless cleanup)
        clearToken()

        // Call Better Auth sign out
        await authClient.signOut()

        // Notify navigation of auth state change
        window.dispatchEvent(new Event("auth-state-change"))

        // Redirect to sign-in page after successful sign out
        router.push("/auth/signin")
      } catch (error) {
        console.error("Sign out error:", error)
        // Ensure token is cleared even on error
        clearToken()
        // Even if sign out fails, redirect to sign-in
        router.push("/auth/signin")
      }
    }

    handleSignOut()
  }, [router])

  return (
    <div className="container">
      <LoadingSpinner text="Signing out..." />
    </div>
  )
}
