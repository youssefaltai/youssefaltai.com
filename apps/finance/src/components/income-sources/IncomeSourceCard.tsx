'use client'

import { TrendingUp } from '@repo/ui'
import type { Account } from '@repo/db'
import { EntityListItem } from '@repo/ui'

interface IncomeSourceCardProps {
  incomeSource: Account
  onClick?: () => void
  isFirst?: boolean
  isLast?: boolean
}

/**
 * Display item for an income source in a grouped list
 */
export function IncomeSourceCard({ incomeSource, onClick, isFirst, isLast }: IncomeSourceCardProps) {
  return (
    <EntityListItem
      icon={TrendingUp}
      iconColor="neutral"
      title={incomeSource.name}
      subtitle={incomeSource.description || undefined}
      rightContent={null}
      onClick={onClick}
      isFirst={isFirst}
      isLast={isLast}
    />
  )
}
