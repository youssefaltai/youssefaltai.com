'use client'

import { TrendingDown } from '@repo/ui'
import type { Account } from '@repo/db'
import { cn } from '@repo/utils'

interface ExpenseCategoryCardProps {
  expenseCategory: Account
  onClick?: () => void
  isFirst?: boolean
  isLast?: boolean
}

/**
 * Display item for an expense category in a grouped list
 * Shows name and description
 */
export function ExpenseCategoryCard({ expenseCategory, onClick, isFirst, isLast }: ExpenseCategoryCardProps) {
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
        <div className="w-12 h-12 rounded-ios bg-ios-red/10 flex items-center justify-center flex-shrink-0">
          <TrendingDown className="w-6 h-6 text-ios-red" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <h3 className="text-ios-headline font-semibold text-ios-label-primary truncate">
            {expenseCategory.name}
          </h3>
          {expenseCategory.description && (
            <p className="text-ios-footnote text-ios-gray-1 truncate mt-0.5">
              {expenseCategory.description}
            </p>
          )}
        </div>
      </div>
    </button>
  )
}

