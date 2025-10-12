'use client'

import { Landmark, Money } from '@repo/ui'
import { formatDueDateStatus, isOverdue } from '../../utils/calculations'
import type { Account } from '@repo/db'
import { EntityListItem } from '@repo/ui'
import { cn } from '@repo/utils'

interface LoanCardProps {
  loan: Account
  onClick?: () => void
  isFirst?: boolean
  isLast?: boolean
}

/**
 * Display item for a loan in a grouped list
 */
export function LoanCard({ loan, onClick, isFirst, isLast }: LoanCardProps) {
  const amountOwed = Number(loan.balance)
  const overdue = loan.dueDate ? isOverdue(loan.dueDate) : false

  return (
    <EntityListItem
      icon={Landmark}
      iconColor="neutral"
      title={loan.name}
      subtitle={loan.description || undefined}
      bottomContent={
        loan.dueDate && (
          <p
            className={cn(
              'text-ios-footnote',
              overdue ? 'text-ios-label-primary font-semibold' : 'text-ios-gray-2'
            )}
          >
            {formatDueDateStatus(loan.dueDate)}
          </p>
        )
      }
      rightContent={
        <div className="text-right">
          <p className="text-ios-callout sm:text-ios-headline font-semibold text-ios-label-primary">
            {<Money amount={amountOwed} currency={loan.currency} />}
          </p>
        </div>
      }
      onClick={onClick}
      isFirst={isFirst}
      isLast={isLast}
    />
  )
}
