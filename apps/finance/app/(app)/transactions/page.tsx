'use client'

import { useMemo } from 'react'
import { Card, FloatingActionButton, Modal } from '@repo/ui'
import { TransactionForm } from '../../components/TransactionForm'
import { formatCurrency, formatDateShort } from '@repo/utils'
import { useTransactions } from '../../../hooks/useTransactions'
import { useModalStore } from '../../../stores/useModalStore'
import { useFilterStore } from '../../../stores/useFilterStore'

export default function TransactionsPage() {
  // UI state from Zustand
  const { showAddTransaction, openAddTransaction, closeAddTransaction } = useModalStore()
  const { transactionType, searchQuery, setTransactionType, setSearchQuery } = useFilterStore()

  // Server state from TanStack Query
  const { data: allTransactions = [] } = useTransactions({
    type: transactionType === 'all' ? undefined : transactionType,
  })

  const handleTransactionAdded = () => {
    closeAddTransaction()
    // TanStack Query auto-refetches!
  }

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
    <div className="min-h-screen bg-ios-gray-6">
      <div className="max-w-lg mx-auto">
        {/* Header */}
        <div className="px-4 pt-6 pb-4">
          <h1 className="text-ios-title-1 font-bold text-ios-label-primary">Transactions</h1>
          <p className="text-ios-body text-ios-gray-1 mt-1">Track all your spending</p>
        </div>

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
              className={`px-4 py-2 rounded-full text-ios-callout font-medium transition-all ${
                transactionType === filterOption
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
            <Card className="text-center py-12">
              <svg className="w-16 h-16 mx-auto text-ios-gray-3 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="text-ios-body font-medium text-ios-gray-1">No transactions found</p>
              <p className="text-ios-footnote text-ios-gray-2 mt-1">Try adjusting your filters</p>
            </Card>
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
                    <p
                      className={`text-ios-headline font-bold ml-4 ${
                        transaction.type === 'income' ? 'text-ios-green' : 'text-ios-red'
                      }`}
                    >
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

        {/* Floating Action Button */}
        <FloatingActionButton onClick={openAddTransaction} />

        {/* Add Transaction Modal */}
        <Modal
          isOpen={showAddTransaction}
          onClose={closeAddTransaction}
          title="Add Transaction"
        >
          <TransactionForm onSuccess={handleTransactionAdded} />
        </Modal>
      </div>
    </div>
  )
}

