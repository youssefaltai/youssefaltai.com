'use client'

import { cn } from '@repo/utils'
import type { LucideIcon } from '@repo/ui'

interface EntityListItemProps {
  icon: LucideIcon
  iconColor?: 'blue' | 'neutral'
  title: string
  subtitle?: string
  rightContent: React.ReactNode
  bottomContent?: React.ReactNode
  onClick?: () => void
  isFirst?: boolean
  isLast?: boolean
}

/**
 * Reusable list item component for all entity types
 * Provides consistent structure with icon, title, subtitle, and right content
 */
export function EntityListItem({
  icon: Icon,
  iconColor = 'neutral',
  title,
  subtitle,
  rightContent,
  bottomContent,
  onClick,
  isFirst,
  isLast,
}: EntityListItemProps) {
  const iconColorClasses = {
    blue: 'bg-ios-blue/10 text-ios-blue',
    neutral: 'bg-ios-gray-6 text-ios-gray-1',
  }

  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full px-4 py-3 text-left',
        'hover:bg-ios-gray-6 active:bg-ios-gray-5 transition-colors',
        !isLast && 'border-b border-ios-gray-5',
        isFirst && 'rounded-t-ios',
        isLast && 'rounded-b-ios'
      )}
    >
      <div className="flex items-center gap-4">
        {/* Icon */}
        <div
          className={cn(
            'w-12 h-12 rounded-ios flex items-center justify-center flex-shrink-0',
            iconColorClasses[iconColor]
          )}
        >
          <Icon className="w-6 h-6" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <h3 className="text-ios-headline font-semibold text-ios-label-primary truncate">
            {title}
          </h3>
          {subtitle && (
            <p className="text-ios-footnote text-ios-gray-1 truncate mt-0.5">
              {subtitle}
            </p>
          )}
          {bottomContent && (
            <div className="mt-1">{bottomContent}</div>
          )}
        </div>

        {/* Right Content */}
        {rightContent && (
          <div className="flex-shrink-0">{rightContent}</div>
        )}
      </div>
    </button>
  )
}

