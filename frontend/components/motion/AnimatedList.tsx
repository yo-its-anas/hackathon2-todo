/**
 * AnimatedList Component - List Animation Wrapper
 *
 * Wraps a list of items with AnimatePresence for smooth
 * enter/exit animations. Each child must have a unique key.
 *
 * Usage:
 *   <AnimatedList>
 *     {items.map(item => (
 *       <AnimatedListItem key={item.id}>
 *         <ItemContent />
 *       </AnimatedListItem>
 *     ))}
 *   </AnimatedList>
 */

'use client'

import { AnimatePresence, motion } from 'motion/react'
import { ReactNode } from 'react'
import { durations, easings, listItemTransition } from '@/lib/motion-config'

interface AnimatedListProps {
  children: ReactNode
  className?: string
  mode?: 'sync' | 'wait' | 'popLayout'
}

interface AnimatedListItemProps {
  children: ReactNode
  className?: string
  layout?: boolean
}

export function AnimatedList({
  children,
  className = '',
  mode = 'popLayout',
}: AnimatedListProps) {
  return (
    <AnimatePresence mode={mode}>
      <div className={className}>{children}</div>
    </AnimatePresence>
  )
}

export function AnimatedListItem({
  children,
  className = '',
  layout = true,
}: AnimatedListItemProps) {
  return (
    <motion.div
      layout={layout}
      initial={listItemTransition.initial}
      animate={listItemTransition.animate}
      exit={listItemTransition.exit}
      transition={{
        ...listItemTransition.transition,
        layout: {
          duration: durations.fast,
          ease: easings.easeInOut,
        },
      }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

export default AnimatedList
