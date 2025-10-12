'use client'

import { CreditCard } from '@repo/ui'
import { formatCurrency } from '../../utils/format'
import type { Account } from '@repo/db'
import { cn } from '@repo/utils'

interface CreditCardCardProps {
  creditCard: Account
  onClick?: () => void
  isFirst?: boolean
  isLast?: boolean
}

/**
 * Display item for a credit card in a grouped list
 * Shows name, current balance
 */
export function CreditCardCard({ creditCard, onClick, isFirst, isLast }: CreditCardCardProps) {
  const balance = Number(creditCard.balance)

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
        <div className="w-12 h-12 rounded-ios bg-ios-blue/10 flex items-center justify-center flex-shrink-0">
          <CreditCard className="w-6 h-6 text-ios-blue" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <h3 className="text-ios-headline font-semibold text-ios-label-primary truncate">
            {creditCard.name}
          </h3>
          {creditCard.description && (
            <p className="text-ios-footnote text-ios-gray-1 truncate mt-0.5">
              {creditCard.description}
            </p>
          )}
        </div>

        {/* Balance */}
        <div className="text-right flex-shrink-0">
          <p className="text-ios-headline font-semibold text-ios-label-primary">
            {formatCurrency(balance, creditCard.currency)}
          </p>
        </div>
      </div>
    </button>
  )
}

