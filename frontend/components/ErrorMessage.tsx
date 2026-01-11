/**
 * ErrorMessage Component (T022-T023)
 *
 * Reusable error display with enter/exit animations.
 * Features:
 * - Smooth enter/exit transitions
 * - AnimatePresence support
 * - Optional retry functionality
 * - Type variants (error, warning, info)
 * - Accessible with ARIA live regions
 */

'use client'

import { motion } from 'motion/react'
import { durations, easings } from '@/lib/motion-config'

interface ErrorMessageProps {
  message: string
  onRetry?: () => void
  type?: 'error' | 'warning' | 'info'
}

const colors = {
  error: {
    bg: '#ffebee',
    border: 'var(--color-error)',
    text: '#c62828',
    icon: '⚠️',
  },
  warning: {
    bg: '#fff3e0',
    border: '#f57c00',
    text: '#e65100',
    icon: '⚡',
  },
  info: {
    bg: '#e3f2fd',
    border: '#1976d2',
    text: '#0d47a1',
    icon: 'ℹ️',
  },
}

export default function ErrorMessage({
  message,
  onRetry,
  type = 'error',
}: ErrorMessageProps) {
  const colorScheme = colors[type]

  return (
    <motion.div
      className="error-message"
      initial={{ opacity: 0, y: -10, height: 0 }}
      animate={{ opacity: 1, y: 0, height: 'auto' }}
      exit={{ opacity: 0, y: -10, height: 0 }}
      transition={{ duration: durations.fast, ease: easings.easeOut }}
      style={{
        backgroundColor: colorScheme.bg,
        border: `2px solid ${colorScheme.border}`,
        borderRadius: 'var(--radius-md)',
        padding: 'var(--spacing-md)',
        marginBottom: 'var(--spacing-md)',
        overflow: 'hidden',
      }}
      role="alert"
      aria-live="assertive"
    >
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: durations.fast, delay: 0.05 }}
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: 'var(--spacing-sm)',
          marginBottom: onRetry ? 'var(--spacing-sm)' : '0',
        }}
      >
        <motion.span
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ duration: durations.fast, delay: 0.1 }}
          style={{
            fontSize: 'var(--font-size-lg)',
            fontWeight: 'bold',
          }}
          aria-hidden="true"
        >
          {colorScheme.icon}
        </motion.span>
        <p
          style={{
            flex: 1,
            color: colorScheme.text,
            fontSize: 'var(--font-size-base)',
            margin: 0,
          }}
        >
          {message}
        </p>
      </motion.div>

      {onRetry && (
        <motion.button
          onClick={onRetry}
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: durations.fast, delay: 0.15 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          style={{
            backgroundColor: colorScheme.border,
            color: 'white',
            padding: 'var(--spacing-sm) var(--spacing-md)',
            borderRadius: 'var(--radius-sm)',
            fontSize: 'var(--font-size-sm)',
            fontWeight: '600',
            marginTop: 'var(--spacing-sm)',
            minHeight: 'var(--touch-target-min)',
            minWidth: 'var(--touch-target-min)',
            border: 'none',
            cursor: 'pointer',
          }}
        >
          Try Again
        </motion.button>
      )}
    </motion.div>
  )
}
