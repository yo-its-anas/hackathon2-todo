/**
 * LoadingSpinner Component (T018-T019)
 *
 * Reusable loading indicator with smooth animations.
 * Features:
 * - Multiple size variants (small, medium, large)
 * - Refined spinning animation
 * - Fade-in entrance animation
 * - Accessible with ARIA labels
 */

'use client'

import { motion } from 'motion/react'
import { durations, easings } from '@/lib/motion-config'

interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large'
  text?: string
}

const sizes = {
  small: { spinner: 16, border: 2 },
  medium: { spinner: 32, border: 3 },
  large: { spinner: 48, border: 4 },
}

export default function LoadingSpinner({
  size = 'medium',
  text = 'Loading...',
}: LoadingSpinnerProps) {
  const { spinner, border } = sizes[size]

  return (
    <motion.div
      className="loading-spinner"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: durations.base, ease: easings.easeOut }}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 'var(--spacing-md)',
        padding: 'var(--spacing-lg)',
      }}
    >
      <motion.div
        style={{
          width: spinner,
          height: spinner,
          border: `${border}px solid var(--color-border)`,
          borderTop: `${border}px solid var(--color-primary)`,
          borderRadius: '50%',
        }}
        animate={{ rotate: 360 }}
        transition={{
          duration: 0.8,
          ease: 'linear',
          repeat: Infinity,
        }}
        role="status"
        aria-label={text}
      />
      {text && (
        <motion.p
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: durations.fast, delay: 0.1 }}
          style={{
            color: 'var(--color-text-secondary)',
            fontSize: 'var(--font-size-base)',
            margin: 0,
          }}
        >
          {text}
        </motion.p>
      )}
    </motion.div>
  )
}
