/**
 * Motion Provider - Global Motion Configuration
 *
 * Wraps the application with MotionConfig to:
 * - Respect user's reduced motion preferences
 * - Provide consistent animation defaults
 */

'use client'

import { MotionConfig } from 'motion/react'
import { ReactNode } from 'react'

interface MotionProviderProps {
  children: ReactNode
}

export default function MotionProvider({ children }: MotionProviderProps) {
  return (
    <MotionConfig reducedMotion="user">
      {children}
    </MotionConfig>
  )
}
