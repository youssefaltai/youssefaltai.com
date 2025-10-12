'use client'

import { Card } from '@repo/ui'
import type { LucideIcon } from '@repo/ui'
import { cn } from '@repo/utils'

interface SummaryCardProps {
  title: string
  value: string
  icon: LucideIcon
  trend?: {
    value: number
    isPositive: boolean
  }
  color?: 'blue' | 'green' | 'red' | 'orange'
}

/**
 * Summary card for dashboard metrics
 * Shows a metric with icon, value, and optional trend
 */
export function SummaryCard({
  title,
  value,
  icon: Icon,
  trend,
  color = 'blue',
}: SummaryCardProps) {
  const colorClasses = {
    blue: 'bg-ios-blue/10 text-ios-blue',
    green: 'bg-ios-green/10 text-ios-green',
    red: 'bg-ios-red/10 text-ios-red',
    orange: 'bg-ios-orange/10 text-ios-orange',
  }

  return (
    <Card>
      <div className="flex items-start justify-between">
        {/* Icon */}
        <div
          className={cn(
            'w-12 h-12 rounded-ios flex items-center justify-center',
            colorClasses[color]
          )}
        >
          <Icon className="w-6 h-6" />
        </div>

        {/* Trend */}
        {trend && (
          <span
            className={cn(
              'text-ios-caption font-semibold px-2 py-1 rounded-full',
              trend.isPositive
                ? 'bg-ios-green/10 text-ios-green'
                : 'bg-ios-red/10 text-ios-red'
            )}
          >
            {trend.isPositive ? '+' : ''}{trend.value}%
          </span>
        )}
      </div>

      {/* Content */}
      <div className="mt-4">
        <p className="text-ios-footnote text-ios-gray-1">{title}</p>
        <p className="text-ios-title-2 font-bold text-ios-label-primary mt-1">
          {value}
        </p>
      </div>
    </Card>
  )
}

