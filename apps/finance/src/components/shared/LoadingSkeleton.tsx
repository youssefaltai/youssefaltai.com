'use client'

import { PageHeader } from '@repo/ui'

interface LoadingSkeletonProps {
  title: string
  subtitle?: string
  itemCount?: number
  itemHeight?: number
}

/**
 * Reusable loading skeleton for list pages
 * Matches PageLayout structure exactly
 */
export function LoadingSkeleton({ title, subtitle, itemCount = 3, itemHeight = 20 }: LoadingSkeletonProps) {
  return (
    <div className="min-h-screen pb-24">
      {/* Fixed Header Area - matches PageLayout */}
      <div className="px-4 pt-6 pb-4">
        <PageHeader title={title} subtitle={subtitle} />
      </div>

      {/* Content Area - matches PageLayout */}
      <div className="px-4">
        <div className="space-y-3">
          {Array.from({ length: itemCount }).map((_, i) => (
            <div
              key={i}
              className="bg-ios-gray-5 rounded-ios animate-pulse"
              style={{ height: `${itemHeight * 4}px` }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
