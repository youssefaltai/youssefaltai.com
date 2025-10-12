'use client'

import { ReactNode } from 'react'
import { cn } from '@repo/utils'

export interface DashboardWidgetProps {
  title?: string
  subtitle?: string
  action?: ReactNode
  children: ReactNode
  className?: string
  loading?: boolean
  error?: string | null
  isEmpty?: boolean
  emptyMessage?: string
  emptyIcon?: ReactNode
}

/**
 * Reusable widget container for dashboard
 * Provides consistent styling, loading states, and error handling
 */
export function DashboardWidget({
  title,
  subtitle,
  action,
  children,
  className,
  loading = false,
  error = null,
  isEmpty = false,
  emptyMessage = 'No data available',
  emptyIcon,
}: DashboardWidgetProps) {
  return (
    <div className={cn('bg-white rounded-ios-lg shadow-ios border border-ios-gray-5', className)}>
      {/* Header */}
      {(title || action) && (
        <div className="flex items-center justify-between px-4 py-3 border-b border-ios-gray-5">
          <div className="flex-1">
            {title && (
              <h3 className="text-ios-title-3 font-semibold text-ios-label-primary">{title}</h3>
            )}
            {subtitle && <p className="text-ios-caption text-ios-gray-2 mt-0.5">{subtitle}</p>}
          </div>
          {action && <div className="ml-3">{action}</div>}
        </div>
      )}

      {/* Content */}
      <div className="p-4">
        {error ? (
          <div className="text-center py-8">
            <p className="text-ios-body text-ios-red">{error}</p>
          </div>
        ) : loading ? (
          <div className="space-y-3">
            <div className="h-4 bg-ios-gray-6 rounded animate-pulse" />
            <div className="h-4 bg-ios-gray-6 rounded animate-pulse w-3/4" />
            <div className="h-4 bg-ios-gray-6 rounded animate-pulse w-1/2" />
          </div>
        ) : isEmpty ? (
          <div className="text-center py-8">
            {emptyIcon && <div className="flex justify-center mb-3 text-ios-gray-2">{emptyIcon}</div>}
            <p className="text-ios-body text-ios-gray-2">{emptyMessage}</p>
          </div>
        ) : (
          children
        )}
      </div>
    </div>
  )
}

/**
 * Widget stat display (for key metrics)
 */
export function WidgetStat({
  label,
  value,
  change,
  changeType = 'neutral',
  icon,
}: {
  label: string
  value: string
  change?: string
  changeType?: 'positive' | 'negative' | 'neutral'
  icon?: ReactNode
}) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-1">
        {icon && <div className="text-ios-gray-2">{icon}</div>}
        <p className="text-ios-caption text-ios-gray-2">{label}</p>
      </div>
      <div className="flex items-baseline gap-2">
        <p className="text-ios-headline sm:text-ios-title-2 font-semibold text-ios-label-primary">
          {value}
        </p>
        {change && (
          <p
            className={cn(
              'text-ios-footnote font-medium',
              changeType === 'positive' && 'text-ios-green',
              changeType === 'negative' && 'text-ios-red',
              changeType === 'neutral' && 'text-ios-gray-2'
            )}
          >
            {change}
          </p>
        )}
      </div>
    </div>
  )
}

