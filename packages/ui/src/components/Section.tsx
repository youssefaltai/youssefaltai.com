'use client'

interface SectionProps {
  title: string
  action?: React.ReactNode
  children: React.ReactNode
  className?: string
}

/**
 * Section header with optional action
 * Provides consistent spacing for content sections
 */
export function Section({ title, action, children, className }: SectionProps) {
  return (
    <div className={className}>
      <div className="flex items-center justify-between mb-3 px-2">
        <h2 className="text-ios-title-3 font-semibold text-ios-label-primary">
          {title}
        </h2>
        {action && <div>{action}</div>}
      </div>
      {children}
    </div>
  )
}

