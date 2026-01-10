/**
 * OfflineWarning Component
 *
 * Displays a warning banner when the user goes offline.
 * Automatically shows/hides based on navigator.onLine status.
 */

"use client"

import { useState, useEffect } from "react"

export default function OfflineWarning() {
  const [isOffline, setIsOffline] = useState(false)

  useEffect(() => {
    // Set initial state
    setIsOffline(!navigator.onLine)

    // Listen for online/offline events
    const handleOnline = () => setIsOffline(false)
    const handleOffline = () => setIsOffline(true)

    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)

    return () => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
    }
  }, [])

  if (!isOffline) {
    return null
  }

  return (
    <div
      style={{
        position: "fixed",
        top: 60,
        left: 0,
        right: 0,
        backgroundColor: "#ff9800",
        color: "white",
        padding: "var(--spacing-md)",
        textAlign: "center",
        zIndex: 1000,
        boxShadow: "var(--shadow-md)",
        fontSize: "var(--font-size-sm)",
        fontWeight: "600",
      }}
      role="alert"
      aria-live="assertive"
    >
      ⚠️ You are offline. Some features may not be available.
    </div>
  )
}
