/**
 * Root Layout - Responsive Navigation
 *
 * Features:
 * - Mobile-first responsive design
 * - Hamburger menu for mobile screens
 * - Sticky navigation bar
 * - Accessible navigation with ARIA labels
 * - Offline detection warning
 */

import type { Metadata, Viewport } from 'next'
import './globals.css'
import Navigation from './Navigation'
import OfflineWarning from '@/components/OfflineWarning'

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
        <Navigation />
        <OfflineWarning />
        {children}
      </body>
    </html>
  )
}
