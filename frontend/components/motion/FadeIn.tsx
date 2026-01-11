/**
 * FadeIn Component - Reusable Fade Animation
 *
 * A utility component that wraps children with a fade-in animation.
 * Respects reduced motion preferences via MotionConfig.
 *
 * Usage:
 *   <FadeIn>
 *     <YourContent />
 *   </FadeIn>
 *
 *   <FadeIn delay={0.1} duration={0.3}>
 *     <YourContent />
 *   </FadeIn>
 */

'use client'

import { motion } from 'motion/react'
import { ReactNode } from 'react'
import { durations, easings, variants } from '@/lib/motion-config'

interface FadeInProps {
  children: ReactNode
  delay?: number
  duration?: number
  className?: string
}

export default function FadeIn({
  children,
  delay = 0,
  duration = durations.base,
  className = '',
}: FadeInProps) {
  return (
    <motion.div
      initial={variants.fadeIn.initial}
      animate={variants.fadeIn.animate}
      exit={variants.fadeIn.exit}
      transition={{
        duration,
        delay,
        ease: easings.easeOut,
      }}
      className={className}
    >
      {children}
    </motion.div>
  )
}
