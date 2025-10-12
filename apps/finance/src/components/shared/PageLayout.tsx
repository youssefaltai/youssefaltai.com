'use client'

import { PageHeader } from '@repo/ui'

interface PageLayoutProps {
  title: string
  subtitle?: string
  headerAction?: React.ReactNode
  children: React.ReactNode
}

/**
 * Standard page layout for all entity pages
 * Ensures consistent padding, spacing, and structure
 */
export function PageLayout({ title, subtitle, headerAction, children }: PageLayoutProps) {
  return (
    <div className="min-h-screen pb-24">
      {/* Fixed Header Area */}
      <div className="px-4 pt-6 pb-4">
        <div className="flex items-start justify-between">
          <PageHeader title={title} subtitle={subtitle} />
          {headerAction}
        </div>
      </div>

      {/* Content Area */}
      <div className="px-4">
        {children}
      </div>
    </div>
  )
}

