'use client'

import { Landmark } from '@repo/ui'
import { formatCurrency } from '../../utils/format'
import { formatDueDateStatus, isOverdue } from '../../utils/calculations'
import type { Account } from '@repo/db'
import { cn } from '@repo/utils'

interface LoanCardProps {
  loan: Account
  onClick?: () => void
  isFirst?: boolean
  isLast?: boolean
}

/**
 * Display item for a loan in a grouped list
 * Shows name, amount owed, and due date
 */
export function LoanCard({ loan, onClick, isFirst, isLast }: LoanCardProps) {
  const amountOwed = Number(loan.balance)
  const overdue = loan.dueDate ? isOverdue(loan.dueDate) : false

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
        <div className="w-12 h-12 rounded-ios bg-ios-orange/10 flex items-center justify-center flex-shrink-0">
          <Landmark className="w-6 h-6 text-ios-orange" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <h3 className="text-ios-headline font-semibold text-ios-label-primary truncate">
            {loan.name}
          </h3>
          {loan.description && (
            <p className="text-ios-footnote text-ios-gray-1 truncate mt-0.5">
              {loan.description}
            </p>
          )}
          {loan.dueDate && (
            <p
              className={cn(
                'text-ios-footnote mt-1',
                overdue ? 'text-ios-red font-semibold' : 'text-ios-gray-2'
              )}
            >
              {formatDueDateStatus(loan.dueDate)}
            </p>
          )}
        </div>

        {/* Amount */}
        <div className="text-right flex-shrink-0">
          <p className="text-ios-headline font-semibold text-ios-red">
            {formatCurrency(amountOwed, loan.currency)}
          </p>
        </div>
      </div>
    </button>
  )
}

