'use client'

interface GroupedListProps {
  children: React.ReactNode
}

/**
 * Reusable grouped list container
 * Provides the iOS-style rounded container with shadow
 */
export function GroupedList({ children }: GroupedListProps) {
  return (
    <div className="bg-white rounded-ios border border-ios-gray-5 shadow-ios-sm overflow-hidden">
      {children}
    </div>
  )
}

