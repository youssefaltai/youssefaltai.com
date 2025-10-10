'use client'

import { useMemo } from 'react'
import { Card, Receipt, PageHeader, EmptyState } from '@repo/ui'
import { formatCurrency, formatDateShort, getTransactionColorClass } from '@repo/utils'
import { useTransactions } from '@/features/transactions/hooks/useTransactions'
import { useFilterStore } from '@/features/transactions/stores/useFilterStore'

export default function TransactionsPage() {
  // UI state from Zustand
  const { transactionType, searchQuery, setTransactionType, setSearchQuery } = useFilterStore()

  // Server state from TanStack Query
  const { data: allTransactions = [] } = useTransactions({
    type: transactionType === 'all' ? undefined : transactionType,
  })

  // Client-side filtering for search
  const filteredTransactions = useMemo(
    () =>
      allTransactions.filter(
        (transaction) =>
          transaction.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
          transaction.description?.toLowerCase().includes(searchQuery.toLowerCase())
      ),
    [allTransactions, searchQuery]
  )

  return (
    <>
      <PageHeader title="Transactions" subtitle="Track all your spending" />

        {/* Search Bar */}
        <div className="px-4 mb-4">
          <input
            type="search"
            placeholder="Search transactions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full min-h-[44px] px-4 py-3 bg-white border border-ios-gray-5 rounded-ios-sm text-ios-body placeholder:text-ios-gray-2 focus:outline-none focus:ring-2 focus:ring-ios-blue focus:border-transparent"
          />
        </div>

        {/* Filter Chips */}
        <div className="px-4 mb-6 flex gap-2">
          {(['all', 'income', 'expense'] as const).map((filterOption) => (
            <button
              key={filterOption}
              onClick={() => setTransactionType(filterOption)}
              className={`px-4 py-2 rounded-full text-ios-callout font-medium transition-all ${transactionType === filterOption
                  ? 'bg-ios-blue text-white'
                  : 'bg-white text-ios-gray-1 border border-ios-gray-5'
                }`}
            >
              {filterOption.charAt(0).toUpperCase() + filterOption.slice(1)}
            </button>
          ))}
        </div>

        {/* Transactions List */}
        <div className="px-4 mb-6">
          {filteredTransactions.length === 0 ? (
            <EmptyState
              icon={Receipt}
              title="No transactions found"
              description="Try adjusting your filters"
            />
          ) : (
            <Card padding="none">
              {filteredTransactions.map((transaction, index) => (
                <div
                  key={transaction.id}
                  className={`p-4 ${index !== filteredTransactions.length - 1 ? 'border-b border-ios-gray-5' : ''}`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex-1">
                      <p className="text-ios-body font-semibold text-ios-label-primary">{transaction.category}</p>
                      {transaction.description && (
                        <p className="text-ios-footnote text-ios-gray-1 mt-1">{transaction.description}</p>
                      )}
                    </div>
                    <p className={`text-ios-headline font-bold ml-4 ${getTransactionColorClass(transaction.type)}`}>
                      {transaction.type === 'income' ? '+' : '-'}
                      {formatCurrency(transaction.baseAmount, transaction.baseCurrency)}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 text-ios-caption text-ios-gray-2">
                    <span>{formatDateShort(transaction.date)}</span>
                    {transaction.currency !== transaction.baseCurrency && (
                      <span>
                        • {formatCurrency(transaction.amount, transaction.currency)}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </Card>
          )}
        </div>
    </>
  )
}

