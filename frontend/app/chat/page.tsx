"use client"

/**
 * Chat Page - AI Chatbot Interface
 *
 * Features:
 * - Natural language task management
 * - Conversation context persistence
 * - Authentication required
 */

import { useState, useEffect } from "react"
import { authClient } from "@/lib/auth-client"
import ChatInterface from "@/components/chat/ChatInterface"
import LoadingSpinner from "@/components/LoadingSpinner"
import styles from "./chat.module.css"

export default function ChatPage() {
  const [userId, setUserId] = useState<string | null>(null)
  const [sessionLoading, setSessionLoading] = useState(true)

  useEffect(() => {
    // Fetch session using async getSession method
    authClient
      .getSession()
      .then((result) => {
        if (result.data?.user?.id) {
          setUserId(result.data.user.id)
        } else {
          // Redirect to sign-in if not authenticated
          window.location.href = "/auth/signin"
        }
        setSessionLoading(false)
      })
      .catch(() => {
        window.location.href = "/auth/signin"
        setSessionLoading(false)
      })
  }, [])

  if (sessionLoading) {
    return <LoadingSpinner text="Loading..." />
  }

  if (!userId) {
    return null
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.pageHeading}>Chat with AI Assistant</h1>
      <p className={styles.subtitle}>
        Manage your tasks using natural language
      </p>
      <div className={styles.chatWrapper}>
        <ChatInterface userId={userId} />
      </div>
    </div>
  )
}
