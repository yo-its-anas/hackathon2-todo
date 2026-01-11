/**
 * Root Layout - Responsive Navigation with Motion
 *
 * Features:
 * - Mobile-first responsive design
 * - Hamburger menu for mobile screens
 * - Sticky navigation bar
 * - Accessible navigation with ARIA labels
 * - Offline detection warning
 * - MotionConfig for global animation settings
 */

import type { Metadata, Viewport } from 'next'
import './globals.css'
import Navigation from './Navigation'
import OfflineWarning from '@/components/OfflineWarning'
import MotionProvider from '@/components/motion/MotionProvider'

export const metadata: Metadata = {
  title: 'Todo App',
  description: 'Authenticated Todo Application',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <MotionProvider>
          <Navigation />
          <OfflineWarning />
          {children}
        </MotionProvider>
      </body>
    </html>
  )
}
