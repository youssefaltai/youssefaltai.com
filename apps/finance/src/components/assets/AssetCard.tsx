'use client'

import { Money, Wallet, EntityListItem } from '@repo/ui'
import type { Account } from '@repo/db'

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
          <p className="text-ios-callout sm:text-ios-headline font-semibold text-ios-label-primary">
            <Money amount={balance} currency={asset.currency} />
          </p>
        </div>
      }
      onClick={onClick}
      isFirst={isFirst}
      isLast={isLast}
    />
  )
}
