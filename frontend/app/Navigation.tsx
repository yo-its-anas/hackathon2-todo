"use client"

/**
 * Navigation Component (T031) - Animated Navigation Bar
 *
 * Features:
 * - Hamburger menu with smooth animation
 * - Mobile menu slide-in/out animation
 * - Touch-friendly targets (44px minimum)
 * - Keyboard accessible
 * - Auto-closes on navigation
 * - Session-aware auth buttons
 */

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "motion/react"
import { durations, easings } from "@/lib/motion-config"
import { authClient } from "@/lib/auth-client"
import styles from "./layout.module.css"

export default function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  const checkSession = useCallback(() => {
    authClient.getSession().then((result) => {
      setIsAuthenticated(!!result.data?.user?.id)
    }).catch(() => {
      setIsAuthenticated(false)
    })
  }, [])

  useEffect(() => {
    // Check session on mount
    checkSession()

    // Listen for auth state changes (dispatched from sign-in/sign-out)
    const handleAuthChange = () => checkSession()
    window.addEventListener("auth-state-change", handleAuthChange)

    return () => {
      window.removeEventListener("auth-state-change", handleAuthChange)
    }
  }, [checkSession])

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  const closeMenu = () => {
    setIsMenuOpen(false)
  }

  return (
    <nav className={styles.nav} role="navigation" aria-label="Main navigation">
      <div className={styles.navContainer}>
        <motion.h1
          className={styles.navTitle}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: durations.base, ease: easings.easeOut }}
        >
          Todo App
        </motion.h1>

        {/* Hamburger Button (Mobile Only) */}
        <motion.button
          className={`${styles.hamburgerButton} ${isMenuOpen ? styles.open : ""}`}
          onClick={toggleMenu}
          aria-label={isMenuOpen ? "Close menu" : "Open menu"}
          aria-expanded={isMenuOpen}
          aria-controls="nav-links"
          whileTap={{ scale: 0.95 }}
        >
          <span className={styles.hamburgerLine}></span>
          <span className={styles.hamburgerLine}></span>
          <span className={styles.hamburgerLine}></span>
        </motion.button>

        {/* Navigation Links - Desktop (always visible) */}
        <div className={styles.navLinksDesktop}>
          {isAuthenticated ? (
            <>
              <Link href="/tasks" className={styles.navLink}>
                My Tasks
              </Link>
              <Link href="/auth/signout" className={styles.signOutButton}>
                Sign Out
              </Link>
            </>
          ) : (
            <>
              <Link href="/auth/signin" className={styles.navLink}>
                Sign In
              </Link>
              <Link href="/auth/signup" className={styles.signOutButton}>
                Get Started
              </Link>
            </>
          )}
        </div>

        {/* Navigation Links - Mobile (animated) */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              id="nav-links"
              className={styles.navLinksMobile}
              role="menubar"
              initial={{ opacity: 0, y: -10, height: 0 }}
              animate={{ opacity: 1, y: 0, height: "auto" }}
              exit={{ opacity: 0, y: -10, height: 0 }}
              transition={{ duration: durations.fast, ease: easings.easeOut }}
            >
              {isAuthenticated ? (
                <>
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: durations.fast, delay: 0.05 }}
                  >
                    <Link
                      href="/tasks"
                      className={styles.navLink}
                      onClick={closeMenu}
                      role="menuitem"
                    >
                      My Tasks
                    </Link>
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: durations.fast, delay: 0.08 }}
                  >
                    <Link
                      href="/auth/signout"
                      className={styles.signOutButton}
                      onClick={closeMenu}
                      role="menuitem"
                    >
                      Sign Out
                    </Link>
                  </motion.div>
                </>
              ) : (
                <>
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: durations.fast, delay: 0.05 }}
                  >
                    <Link
                      href="/auth/signin"
                      className={styles.navLink}
                      onClick={closeMenu}
                      role="menuitem"
                    >
                      Sign In
                    </Link>
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: durations.fast, delay: 0.08 }}
                  >
                    <Link
                      href="/auth/signup"
                      className={styles.signOutButton}
                      onClick={closeMenu}
                      role="menuitem"
                    >
                      Get Started
                    </Link>
                  </motion.div>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  )
}
