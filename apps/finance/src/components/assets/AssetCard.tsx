'use client'

import { Wallet } from '@repo/ui'
import { formatCurrency } from '../../utils/format'
import type { Account } from '@repo/db'
import { EntityListItem } from '../shared/EntityListItem'

interface AssetCardProps {
  asset: Account
  onClick?: () => void
  isFirst?: boolean
  isLast?: boolean
}

/**
 * Display item for an asset in a grouped list
 */
export function AssetCard({ asset, onClick, isFirst, isLast }: AssetCardProps) {
  const balance = Number(asset.balance)

  return (
    <EntityListItem
      icon={Wallet}
      iconColor="neutral"
      title={asset.name}
      subtitle={asset.description || undefined}
      rightContent={
        <div className="text-right">
          <p className="text-ios-headline font-semibold text-ios-label-primary">
            {formatCurrency(balance, asset.currency)}
          </p>
        </div>
      }
      onClick={onClick}
      isFirst={isFirst}
      isLast={isLast}
    />
  )
}
