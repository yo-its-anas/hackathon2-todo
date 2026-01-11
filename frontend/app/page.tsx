/**
 * Landing Page (T027-T028)
 *
 * Entry point for new users with animated entrance.
 * Features:
 * - Fade-in hero animation
 * - Staggered feature list animation
 * - Smooth button hover effects
 */

'use client'

import { motion } from 'motion/react'
import { durations, easings, variants } from '@/lib/motion-config'

export default function Home() {
  const features = [
    { icon: '✅', text: 'Create and manage tasks' },
    { icon: '🔒', text: 'Secure authentication' },
    { icon: '📱', text: 'Mobile-friendly interface' },
    { icon: '☁️', text: 'Cloud-based storage' },
  ]

  return (
    <main className="container">
      <div
        style={{
          maxWidth: '600px',
          margin: '0 auto',
          textAlign: 'center',
          paddingTop: 'var(--spacing-2xl)',
        }}
      >
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: durations.base, ease: easings.easeOut }}
          style={{
            fontSize: 'var(--font-size-3xl)',
            fontWeight: '700',
            marginBottom: 'var(--spacing-md)',
            color: 'var(--color-primary)',
          }}
        >
          Welcome to Todo App
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: durations.base, delay: 0.1, ease: easings.easeOut }}
          style={{
            fontSize: 'var(--font-size-lg)',
            color: 'var(--color-text-secondary)',
            marginBottom: 'var(--spacing-2xl)',
            lineHeight: '1.6',
          }}
        >
          A simple, secure task management application. Organize your daily tasks,
          track your progress, and stay productive.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: durations.base, delay: 0.2, ease: easings.easeOut }}
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--spacing-md)',
            alignItems: 'center',
          }}
        >
          <motion.a
            href="/auth/signup"
            whileHover={{ scale: 1.02, boxShadow: 'var(--shadow-lg)' }}
            whileTap={{ scale: 0.98 }}
            transition={{ duration: durations.micro }}
            style={{
              display: 'inline-block',
              backgroundColor: 'var(--color-primary)',
              color: 'white',
              padding: 'var(--spacing-md) var(--spacing-xl)',
              borderRadius: 'var(--radius-md)',
              fontSize: 'var(--font-size-lg)',
              fontWeight: '600',
              textDecoration: 'none',
              minHeight: 'var(--touch-target-min)',
              minWidth: '200px',
              textAlign: 'center',
              lineHeight: 'var(--touch-target-min)',
              boxShadow: 'var(--shadow-md)',
            }}
          >
            Get Started
          </motion.a>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: durations.fast, delay: 0.3 }}
            style={{ color: 'var(--color-text-secondary)' }}
          >
            Already have an account?{' '}
            <a
              href="/auth/signin"
              style={{
                color: 'var(--color-primary)',
                fontWeight: '600',
              }}
            >
              Sign In
            </a>
          </motion.p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: durations.base, delay: 0.35, ease: easings.easeOut }}
          style={{
            marginTop: 'var(--spacing-2xl)',
            paddingTop: 'var(--spacing-2xl)',
            borderTop: '1px solid var(--color-border)',
          }}
        >
          <motion.h2
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: durations.fast, delay: 0.4 }}
            style={{
              fontSize: 'var(--font-size-xl)',
              fontWeight: '600',
              marginBottom: 'var(--spacing-lg)',
            }}
          >
            Features
          </motion.h2>

          <motion.ul
            style={{
              listStyle: 'none',
              padding: 0,
              display: 'grid',
              gap: 'var(--spacing-md)',
            }}
          >
            {features.map((feature, index) => (
              <motion.li
                key={feature.text}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{
                  duration: durations.fast,
                  delay: 0.45 + index * 0.08,
                  ease: easings.easeOut,
                }}
                style={{ fontSize: 'var(--font-size-base)' }}
              >
                {feature.icon} {feature.text}
              </motion.li>
            ))}
          </motion.ul>
        </motion.div>
      </div>
    </main>
  )
}
