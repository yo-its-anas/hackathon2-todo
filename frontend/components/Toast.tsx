/**
 * Toast Component - Success/Error Notifications
 *
 * Animated notification that appears and auto-dismisses.
 * Uses Motion for smooth enter/exit animations.
 */

'use client'

import { motion, AnimatePresence } from 'motion/react'
import { useEffect } from 'react'
import { toastVariants, transitions } from '@/lib/motion-config'
import styles from './Toast.module.css'

export type ToastType = 'success' | 'error' | 'info'

interface ToastProps {
  message: string
  type?: ToastType
  isVisible: boolean
  onClose: () => void
  duration?: number
}

export default function Toast({
  message,
  type = 'success',
  isVisible,
  onClose,
  duration = 3000,
}: ToastProps) {
  useEffect(() => {
    if (isVisible && duration > 0) {
      const timer = setTimeout(onClose, duration)
      return () => clearTimeout(timer)
    }
  }, [isVisible, duration, onClose])

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className={`${styles.toast} ${styles[type]}`}
          role="status"
          aria-live="polite"
          initial={toastVariants.initial}
          animate={toastVariants.animate}
          exit={toastVariants.exit}
          transition={transitions.base}
        >
          <span className={styles.icon}>
            {type === 'success' && '✓'}
            {type === 'error' && '✕'}
            {type === 'info' && 'ℹ'}
          </span>
          <span className={styles.message}>{message}</span>
          <button
            className={styles.closeButton}
            onClick={onClose}
            aria-label="Close notification"
          >
            ×
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
