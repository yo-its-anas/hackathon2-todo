/**
 * Motion Components - Barrel Export
 *
 * Centralized export for all motion-related components.
 */

export { default as FadeIn } from './FadeIn'
export { AnimatedList, AnimatedListItem, default as AnimatedListDefault } from './AnimatedList'
export { default as MotionProvider } from './MotionProvider'

// Re-export motion primitives for convenience
export { AnimatePresence, motion } from 'motion/react'

// Re-export shared config
export * from '@/lib/motion-config'
