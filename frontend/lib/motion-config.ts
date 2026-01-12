/**
 * Motion Configuration
 *
 * Shared animation presets for consistent motion across the application.
 * All animations follow these principles:
 * - Purpose: Every animation communicates state or guides attention
 * - Speed: Fast enough to not block interaction (≤300ms)
 * - Easing: Natural curves that feel physical
 * - Performance: GPU-accelerated properties only (transform, opacity)
 */

// Duration presets (in seconds)
export const durations = {
  micro: 0.15,   // Hover, focus, button press
  fast: 0.2,     // Toggle, state change
  base: 0.25,    // Enter/exit, fade
  slow: 0.3,     // Page transition, complex layout
} as const

// Easing curves
export const easings = {
  easeOut: [0, 0, 0.2, 1] as const,        // Decelerate (entering)
  easeIn: [0.4, 0, 1, 1] as const,         // Accelerate (exiting)
  easeInOut: [0.4, 0, 0.2, 1] as const,    // Balanced (layout shifts)
}

// Spring configurations
export const springs = {
  gentle: { type: "spring" as const, damping: 25, stiffness: 300 },
  snappy: { type: "spring" as const, damping: 30, stiffness: 400 },
  bouncy: { type: "spring" as const, damping: 20, stiffness: 350 },
}

// Common transition presets
export const transitions = {
  fast: { duration: durations.fast, ease: easings.easeOut },
  base: { duration: durations.base, ease: easings.easeOut },
  slow: { duration: durations.slow, ease: easings.easeInOut },
  spring: springs.gentle,
}

// Animation variants for common patterns
export const variants = {
  // Fade animations
  fadeIn: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
  },

  // Slide up (for new items entering)
  slideUp: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -10 },
  },

  // Slide down (for items from top)
  slideDown: {
    initial: { opacity: 0, y: -20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 20 },
  },

  // Scale (for modals, toasts)
  scale: {
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.95 },
  },

  // Collapse (for deleted items)
  collapse: {
    initial: { opacity: 1, height: "auto" },
    exit: {
      opacity: 0,
      height: 0,
      marginTop: 0,
      marginBottom: 0,
      paddingTop: 0,
      paddingBottom: 0,
    },
  },

  // Stagger children
  staggerContainer: {
    animate: {
      transition: {
        staggerChildren: 0.05,
      },
    },
  },

  staggerItem: {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
  },
}

// List animation configuration for AnimatePresence
export const listItemTransition = {
  layout: true,
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, x: -20, height: 0, marginBottom: 0 },
  transition: transitions.base,
}

// Toast animation
export const toastVariants = {
  initial: { opacity: 0, y: -20, scale: 0.95 },
  animate: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: -20, scale: 0.95 },
}
