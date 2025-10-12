'use client'

import { useState } from 'react'
import { DashboardWidget } from './DashboardWidget'
import { useAccounts } from '../../hooks/use-accounts'
import { Wallet, ChevronDown, ChevronUp, Money } from '@repo/ui'

/**
 * Account balances widget
 * Shows all asset accounts with expandable view
 */
export function AccountBalancesWidget() {
  const { data: accounts, isLoading, error } = useAccounts()
  const [isExpanded, setIsExpanded] = useState(false)

  const assetAccounts = accounts?.filter((acc) => acc.type === 'asset') || []
  const displayAccounts = isExpanded ? assetAccounts : assetAccounts.slice(0, 3)

  return (
    <DashboardWidget
      title="Account Balances"
      subtitle={`${assetAccounts.length} ${assetAccounts.length === 1 ? 'account' : 'accounts'}`}
      loading={isLoading}
      error={error instanceof Error ? error.message : null}
      isEmpty={assetAccounts.length === 0}
      emptyMessage="No accounts yet"
      emptyIcon={<Wallet className="w-12 h-12" />}
    >
      <div className="space-y-3">
        {displayAccounts.map((account, index) => (
          <div
            key={account.id}
            className={`flex items-center justify-between pb-3 ${index < displayAccounts.length - 1 ? 'border-b border-ios-gray-5' : ''
              }`}
          >
            <div className="flex-1 min-w-0">
              <p className="text-ios-body font-medium text-ios-label-primary truncate">
                {account.name}
              </p>
              {account.description && (
                <p className="text-ios-caption text-ios-gray-2 truncate">
                  {account.description}
                </p>
              )}
            </div>
            <p className="text-ios-callout sm:text-ios-body font-semibold text-ios-label-primary ml-4">
              <Money amount={Number(account.balance)} currency={account.currency} />
            </p>
          </div>
        ))}

        {/* Expand/Collapse button */}
        {assetAccounts.length > 3 && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-full flex items-center justify-center gap-2 py-2 text-ios-blue text-ios-body font-medium hover:opacity-70 transition-opacity"
          >
            <span>{isExpanded ? 'Show Less' : `Show ${assetAccounts.length - 3} More`}</span>
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        )}
      </div>
    </DashboardWidget>
  )
}

