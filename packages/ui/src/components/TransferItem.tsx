'use client'

import { ArrowRight } from 'lucide-react'
import { cn } from '@repo/utils'
import { formatDistanceToNow, format, differenceInDays, ensureDate } from '@repo/utils'
import type { LucideIcon } from 'lucide-react'

interface TransferItemProps {
  from: {
    label: string
    icon?: LucideIcon
  }
  to: {
    label: string
    icon?: LucideIcon
  }
  amount: string
  date: Date | string
  description?: string
  onClick?: () => void
  isFirst?: boolean
  isLast?: boolean
}

/**
 * Generic "From → To" transfer display component
 * Shows from/to entities, amount, date, and description
 * Can be used for transactions, transfers, movements, etc.
 */
export function TransferItem({
  from,
  to,
  amount,
  date,
  description,
  onClick,
  isFirst,
  isLast,
}: TransferItemProps) {
  const FromIcon = from.icon
  const ToIcon = to.icon

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
      {/* From/To */}
      <div className="flex items-center gap-2 mb-2">
        {FromIcon && <FromIcon className="w-4 h-4 text-ios-gray-2 flex-shrink-0" />}
        <span className="text-ios-body text-ios-label-primary font-medium truncate">
          {from.label}
        </span>
        <ArrowRight className="w-4 h-4 text-ios-gray-2 flex-shrink-0" />
        {ToIcon && <ToIcon className="w-4 h-4 text-ios-gray-2 flex-shrink-0" />}
        <span className="text-ios-body text-ios-label-primary font-medium truncate">
          {to.label}
        </span>
      </div>

      {/* Description */}
      {description && (
        <p className="text-ios-footnote text-ios-gray-1 mb-2">
          {description}
        </p>
      )}

      {/* Amount and Date */}
      <div className="flex items-center justify-between">
        <span className="text-ios-callout text-ios-gray-2">
          {(() => {
            const dateObj = ensureDate(date)
            const daysDiff = Math.abs(differenceInDays(new Date(), dateObj))
            // Use relative format for dates within 7 days
            if (daysDiff <= 7) {
              return formatDistanceToNow(dateObj, { addSuffix: true })
            }
            // Use full datetime for older dates
            return format(dateObj, 'PP p')
          })()}
        </span>
        <span className="text-ios-callout sm:text-ios-headline font-semibold text-ios-blue">
          {amount}
        </span>
      </div>
    </button>
  )
}

