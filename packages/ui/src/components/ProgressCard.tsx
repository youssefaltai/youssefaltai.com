'use client'

import { ProgressBar } from './ProgressBar'
import { cn } from '@repo/utils'
import { formatDistanceToNow, format, differenceInDays, ensureDate } from '@repo/utils'

interface ProgressCardProps {
  title: string
  description?: string
  current: number
  target: number
  unit?: string
  dueDate?: Date | string
  metadata?: React.ReactNode
  onClick?: () => void
  isFirst?: boolean
  isLast?: boolean
}

/**
 * Generic card with progress bar, title, description
 * Can be used for goals, challenges, achievements, habits, etc.
 */
export function ProgressCard({
  title,
  description,
  current,
  target,
  unit = '',
  dueDate,
  metadata,
  onClick,
  isFirst,
  isLast,
}: ProgressCardProps) {
  const progress = target > 0 ? Math.min((current / target) * 100, 100) : 0
  const isCompleted = progress >= 100

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
      <div className="space-y-3">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="text-ios-headline font-semibold text-ios-label-primary">
              {title}
            </h3>
            {description && (
              <p className="text-ios-footnote text-ios-gray-1 mt-1">
                {description}
              </p>
            )}
          </div>
          {isCompleted && (
            <span className="text-ios-blue text-ios-caption font-semibold">
              COMPLETED
            </span>
          )}
        </div>

        {/* Progress */}
        <div className="space-y-2">
          <ProgressBar value={progress} />
          <div className="flex items-center justify-between text-ios-footnote">
            <span className="text-ios-gray-1">
              {current.toLocaleString()} {unit && unit} of {target.toLocaleString()} {unit && unit}
            </span>
            <span className="text-ios-label-primary font-semibold">
              {Math.round(progress)}%
            </span>
          </div>
        </div>

        {/* Metadata and Due date */}
        {(metadata || dueDate) && (
          <div className="flex items-center justify-between pt-2 border-t border-ios-gray-5">
            {metadata && (
              <div className="text-ios-footnote text-ios-gray-1">
                {metadata}
              </div>
            )}
            {dueDate && (
              <span className="text-ios-footnote text-ios-gray-2">
                {(() => {
                  const dateObj = ensureDate(dueDate)
                  const daysDiff = differenceInDays(dateObj, new Date())
                  // Use relative format for dates within 30 days
                  if (daysDiff >= 0 && daysDiff <= 30) {
                    return formatDistanceToNow(dateObj, { addSuffix: true })
                  }
                  // Use just date for further out
                  return format(dateObj, 'PP')
                })()}
              </span>
            )}
          </div>
        )}
      </div>
    </button>
  )
}

