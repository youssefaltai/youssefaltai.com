'use client'

import { TrendingDown } from '@repo/ui'
import type { Account } from '@repo/db'
import { EntityListItem } from '../shared/EntityListItem'

interface ExpenseCategoryCardProps {
  expenseCategory: Account
  onClick?: () => void
  isFirst?: boolean
  isLast?: boolean
}

/**
 * Display item for an expense category in a grouped list
 */
export function ExpenseCategoryCard({ expenseCategory, onClick, isFirst, isLast }: ExpenseCategoryCardProps) {
  return (
    <EntityListItem
      icon={TrendingDown}
      iconColor="neutral"
      title={expenseCategory.name}
      subtitle={expenseCategory.description || undefined}
      rightContent={null}
      onClick={onClick}
      isFirst={isFirst}
      isLast={isLast}
    />
  )
}
