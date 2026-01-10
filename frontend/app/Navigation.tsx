"use client"

/**
 * Navigation Component - Responsive Navigation Bar
 *
 * Features:
 * - Hamburger menu for mobile (< 768px)
 * - Horizontal menu for tablet and desktop
 * - Touch-friendly targets (44px minimum)
 * - Keyboard accessible
 * - Auto-closes on navigation
 */

import { useState } from "react"
import Link from "next/link"
import styles from "./layout.module.css"

export default function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  const closeMenu = () => {
    setIsMenuOpen(false)
  }

  return (
    <nav className={styles.nav} role="navigation" aria-label="Main navigation">
      <div className={styles.navContainer}>
        <h1 className={styles.navTitle}>Todo App</h1>

        {/* Hamburger Button (Mobile Only) */}
        <button
          className={`${styles.hamburgerButton} ${isMenuOpen ? styles.open : ""}`}
          onClick={toggleMenu}
          aria-label={isMenuOpen ? "Close menu" : "Open menu"}
          aria-expanded={isMenuOpen}
          aria-controls="nav-links"
        >
          <span className={styles.hamburgerLine}></span>
          <span className={styles.hamburgerLine}></span>
          <span className={styles.hamburgerLine}></span>
        </button>

        {/* Navigation Links */}
        <div
          id="nav-links"
          className={`${styles.navLinks} ${isMenuOpen ? styles.open : ""}`}
          role="menubar"
        >
          <Link
            href="/tasks"
            className={styles.navLink}
            onClick={closeMenu}
            role="menuitem"
          >
            My Tasks
          </Link>
          <Link
            href="/auth/signout"
            className={styles.signOutButton}
            onClick={closeMenu}
            role="menuitem"
          >
            Sign Out
          </Link>
        </div>
      </div>
    </nav>
  )
}
