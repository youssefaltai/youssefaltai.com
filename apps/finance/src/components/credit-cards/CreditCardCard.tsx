'use client'

import { CreditCard } from '@repo/ui'
import { formatCurrency } from '../../utils/format'
import type { Account } from '@repo/db'
import { EntityListItem } from '../shared/EntityListItem'

interface CreditCardCardProps {
  creditCard: Account
  onClick?: () => void
  isFirst?: boolean
  isLast?: boolean
}

/**
 * Display item for a credit card in a grouped list
 */
export function CreditCardCard({ creditCard, onClick, isFirst, isLast }: CreditCardCardProps) {
  const balance = Number(creditCard.balance)

  return (
    <EntityListItem
      icon={CreditCard}
      iconColor="neutral"
      title={creditCard.name}
      subtitle={creditCard.description || undefined}
      rightContent={
        <div className="text-right">
          <p className="text-ios-headline font-semibold text-ios-label-primary">
            {formatCurrency(balance, creditCard.currency)}
          </p>
        </div>
      }
      onClick={onClick}
      isFirst={isFirst}
      isLast={isLast}
    />
  )
}
