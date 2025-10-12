'use client'

import { ArrowRight } from '@repo/ui'
import { formatCurrency, formatDate } from '../../utils/format'
import type { TTransaction } from '@repo/db'
import { cn } from '@repo/utils'

interface TransactionItemProps {
  transaction: TTransaction
  onClick?: () => void
  isFirst?: boolean
  isLast?: boolean
}

/**
 * Display component for a single transaction in a grouped list
 * Shows from/to accounts, amount, date, and description
 */
export function TransactionItem({ transaction, onClick, isFirst, isLast }: TransactionItemProps) {
  const amount = Number(transaction.amount)

  // Determine transaction type based on account types
  // For now, we'll use colors to distinguish
  // Green for income, red for expense, blue for transfer

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
        <span className="text-ios-body text-ios-label-primary font-medium truncate">
          {transaction.fromAccount.name}
        </span>
        <ArrowRight className="w-4 h-4 text-ios-gray-2 flex-shrink-0" />
        <span className="text-ios-body text-ios-label-primary font-medium truncate">
          {transaction.toAccount.name}
        </span>
      </div>

      {/* Description */}
      {transaction.description && (
        <p className="text-ios-footnote text-ios-gray-1 mb-2">
          {transaction.description}
        </p>
      )}

      {/* Amount and Date */}
      <div className="flex items-center justify-between">
        <span className="text-ios-callout text-ios-gray-2">
          {formatDate(transaction.date, 'long')}
        </span>
        <span
          className={cn(
            'text-ios-headline font-semibold',
            'text-ios-blue' // Default color, can be enhanced later based on account types
          )}
        >
          {formatCurrency(amount, transaction.currency)}
        </span>
      </div>
    </button>
  )
}

