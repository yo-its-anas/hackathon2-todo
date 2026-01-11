/**
 * OfflineWarning Component (T026)
 *
 * Displays a warning banner when the user goes offline.
 * Features:
 * - Slide-in animation from top
 * - Smooth exit animation
 * - Automatically shows/hides based on navigator.onLine status
 * - Accessible with ARIA live region
 */

'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { durations, easings } from '@/lib/motion-config'

export default function OfflineWarning() {
  const [isOffline, setIsOffline] = useState(false)

  useEffect(() => {
    // Set initial state
    setIsOffline(!navigator.onLine)

    // Listen for online/offline events
    const handleOnline = () => setIsOffline(false)
    const handleOffline = () => setIsOffline(true)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  return (
    <AnimatePresence>
      {isOffline && (
        <motion.div
          initial={{ opacity: 0, y: -60 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -60 }}
          transition={{ duration: durations.base, ease: easings.easeOut }}
          style={{
            position: 'fixed',
            top: 60,
            left: 0,
            right: 0,
            backgroundColor: '#ff9800',
            color: 'white',
            padding: 'var(--spacing-md)',
            textAlign: 'center',
            zIndex: 1000,
            boxShadow: 'var(--shadow-md)',
            fontSize: 'var(--font-size-sm)',
            fontWeight: '600',
          }}
          role="alert"
          aria-live="assertive"
        >
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            ⚠️ You are offline. Some features may not be available.
          </motion.span>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
