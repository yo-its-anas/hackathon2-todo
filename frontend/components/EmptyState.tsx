/**
 * EmptyState Component (T020-T021)
 *
 * Reusable empty state display with fade-in animation.
 * Features:
 * - Smooth entrance animation
 * - Optional call-to-action with hover effects
 * - Enhanced visual design
 * - Accessible structure
 */

'use client'

import { motion } from 'motion/react'
import { durations, easings } from '@/lib/motion-config'

interface EmptyStateProps {
  icon?: string
  title: string
  message: string
  actionLabel?: string
  onAction?: () => void
}

export default function EmptyState({
  icon = '📭',
  title,
  message,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  return (
    <motion.div
      className="empty-state"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: durations.base, ease: easings.easeOut }}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'var(--spacing-2xl)',
        textAlign: 'center',
        backgroundColor: 'var(--color-surface)',
        borderRadius: 'var(--radius-lg)',
        border: '2px dashed var(--color-border)',
      }}
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: durations.base, delay: 0.1, ease: easings.easeOut }}
        style={{
          fontSize: '4rem',
          marginBottom: 'var(--spacing-md)',
        }}
        aria-hidden="true"
      >
        {icon}
      </motion.div>

      <motion.h2
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: durations.fast, delay: 0.15 }}
        style={{
          fontSize: 'var(--font-size-2xl)',
          fontWeight: '600',
          color: 'var(--color-text)',
          marginBottom: 'var(--spacing-sm)',
        }}
      >
        {title}
      </motion.h2>

      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: durations.fast, delay: 0.2 }}
        style={{
          fontSize: 'var(--font-size-base)',
          color: 'var(--color-text-secondary)',
          maxWidth: '400px',
          marginBottom: actionLabel ? 'var(--spacing-lg)' : '0',
        }}
      >
        {message}
      </motion.p>

      {actionLabel && onAction && (
        <motion.button
          onClick={onAction}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: durations.fast, delay: 0.25 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          style={{
            backgroundColor: 'var(--color-primary)',
            color: 'white',
            padding: 'var(--spacing-md) var(--spacing-lg)',
            borderRadius: 'var(--radius-md)',
            fontSize: 'var(--font-size-base)',
            fontWeight: '600',
            minHeight: 'var(--touch-target-min)',
            minWidth: 'var(--touch-target-min)',
            border: 'none',
            cursor: 'pointer',
            transition: 'background-color 0.15s ease',
          }}
        >
          {actionLabel}
        </motion.button>
      )}
    </motion.div>
  )
}
