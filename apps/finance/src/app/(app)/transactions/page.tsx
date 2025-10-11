'use client'

import { useMemo, useState, useRef } from 'react'
import { Card, Receipt, PageHeader, EmptyState, FloatingActionButton, Plus, Modal, X, Edit, Trash2 } from '@repo/ui'
import { formatCurrency, formatDateShort, getTransactionColorClass } from '@repo/utils'
import { useTransactions } from '@/features/transactions/hooks/useTransactions'
import { useDeleteTransaction } from '@/features/transactions/hooks/useDeleteTransaction'
import { useFilterStore } from '@/features/transactions/stores/useFilterStore'
import { TransactionForm } from '@/features/transactions/components/TransactionForm'
import type { Transaction } from '@repo/types'

export default function TransactionsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isActionModalOpen, setIsActionModalOpen] = useState(false)
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null)
  const [actionTransaction, setActionTransaction] = useState<Transaction | null>(null)
  const longPressTimer = useRef<NodeJS.Timeout | null>(null)
  
  // UI state from Zustand
  const { 
    transactionType, 
    searchQuery, 
    selectedCategories,
    dateFrom,
    dateTo,
    setTransactionType, 
    setSearchQuery,
    toggleCategory,
    clearCategories,
    setDateFrom,
    setDateTo,
    resetFilters
  } = useFilterStore()

  // Server state from TanStack Query
  const { data: allTransactions = [] } = useTransactions({
    type: transactionType === 'all' ? undefined : transactionType,
  })
  const deleteTransaction = useDeleteTransaction()

  // Get unique categories from transactions for filter
  const availableCategories = useMemo(() => {
    const categorySet = new Set(allTransactions.map(t => t.category))
    return Array.from(categorySet).sort()
  }, [allTransactions])

  // Client-side filtering (search, category, date)
  const filteredTransactions = useMemo(
    () =>
      allTransactions.filter(
        (transaction) => {
          // Search filter
          const query = searchQuery.toLowerCase()
          const matchesSearch = !query || 
            transaction.category.toLowerCase().includes(query) ||
            (transaction.description?.toLowerCase().includes(query) ?? false)
          
          // Category filter (multiple categories)
          const matchesCategory = selectedCategories.length === 0 || 
            selectedCategories.includes(transaction.category)
          
          // Date filters
          const transactionDate = new Date(transaction.date)
          const matchesDateFrom = !dateFrom || transactionDate >= new Date(dateFrom)
          const matchesDateTo = !dateTo || transactionDate <= new Date(dateTo)
          
          return matchesSearch && matchesCategory && matchesDateFrom && matchesDateTo
        }
      ),
    [allTransactions, searchQuery, selectedCategories, dateFrom, dateTo]
  )

  const handleLongPressStart = (transaction: Transaction) => {
    longPressTimer.current = setTimeout(() => {
      setActionTransaction(transaction)
      setIsActionModalOpen(true)
      // Haptic feedback if available
      if (navigator.vibrate) {
        navigator.vibrate(50)
      }
    }, 500) // 500ms long press
  }

  const handleLongPressEnd = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current)
      longPressTimer.current = null
    }
  }

  const handleEdit = () => {
    if (actionTransaction) {
      setEditingTransaction(actionTransaction)
      setIsActionModalOpen(false)
      setIsModalOpen(true)
      setActionTransaction(null)
    }
  }

  const handleDelete = () => {
    if (actionTransaction) {
      if (confirm(`Delete this ${actionTransaction.type} transaction?`)) {
        deleteTransaction.mutate(actionTransaction.id, {
          onSuccess: () => {
            setIsActionModalOpen(false)
            setActionTransaction(null)
          },
        })
      }
    }
  }

  const handleModalClose = () => {
    setIsModalOpen(false)
    setEditingTransaction(null)
  }

  const handleActionModalClose = () => {
    setIsActionModalOpen(false)
    setActionTransaction(null)
  }

  const handleClearFilters = () => {
    resetFilters()
  }

  const hasActiveFilters = selectedCategories.length > 0 || dateFrom || dateTo

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

        {/* Type Filter Chips */}
        <div className="px-4 mb-4 flex gap-2">
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

        {/* Category Filter Chips */}
        {availableCategories.length > 0 && (
          <div className="px-4 mb-4">
            <div className="flex items-center justify-between mb-2">
              <label className="text-ios-footnote text-ios-gray-1 ml-1">Filter by Categories</label>
              {selectedCategories.length > 0 && (
                <button
                  onClick={clearCategories}
                  className="text-ios-footnote text-ios-blue font-medium"
                >
                  Clear ({selectedCategories.length})
                </button>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              {availableCategories.map((category) => {
                const isSelected = selectedCategories.includes(category)
                return (
                  <button
                    key={category}
                    onClick={() => toggleCategory(category)}
                    className={`px-4 py-2 rounded-full text-ios-callout font-medium transition-all ${
                      isSelected
                        ? 'bg-ios-blue text-white ring-2 ring-ios-blue'
                        : 'bg-white text-ios-gray-1 border border-ios-gray-5 hover:bg-ios-gray-6'
                    }`}
                  >
                    {category}
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* Date Filters */}
        <div className="px-4 mb-4 grid grid-cols-2 gap-3">
          <div>
            <label className="block text-ios-footnote text-ios-gray-1 mb-1 ml-1">From Date</label>
            <input
              type="date"
              value={dateFrom || ''}
              onChange={(e) => setDateFrom(e.target.value || null)}
              className="w-full min-h-[44px] px-4 py-2 bg-white border border-ios-gray-5 rounded-ios-sm text-ios-body focus:outline-none focus:ring-2 focus:ring-ios-blue focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-ios-footnote text-ios-gray-1 mb-1 ml-1">To Date</label>
            <input
              type="date"
              value={dateTo || ''}
              onChange={(e) => setDateTo(e.target.value || null)}
              className="w-full min-h-[44px] px-4 py-2 bg-white border border-ios-gray-5 rounded-ios-sm text-ios-body focus:outline-none focus:ring-2 focus:ring-ios-blue focus:border-transparent"
            />
          </div>
        </div>

        {/* Clear Filters Button */}
        {hasActiveFilters && (
          <div className="px-4 mb-4">
            <button
              onClick={handleClearFilters}
              className="flex items-center gap-2 px-4 py-2 text-ios-callout font-medium text-ios-red hover:bg-ios-red/10 rounded-ios transition-colors"
            >
              <X className="w-4 h-4" />
              Clear Filters
            </button>
          </div>
        )}

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
                  onTouchStart={() => handleLongPressStart(transaction)}
                  onTouchEnd={handleLongPressEnd}
                  onTouchCancel={handleLongPressEnd}
                  onMouseDown={() => handleLongPressStart(transaction)}
                  onMouseUp={handleLongPressEnd}
                  onMouseLeave={handleLongPressEnd}
                  className={`w-full p-4 text-left hover:bg-ios-gray-6 active:bg-ios-gray-5 transition-colors cursor-pointer ${
                    index !== filteredTransactions.length - 1 ? 'border-b border-ios-gray-5' : ''
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex-1">
                      <p className="text-ios-body font-semibold text-ios-label-primary">{transaction.category}</p>
                      {transaction.description && (
                        <p className="text-ios-footnote text-ios-gray-2 mt-1 line-clamp-1">{transaction.description}</p>
                      )}
                      <p className="text-ios-footnote text-ios-gray-1 mt-1">{formatDateShort(transaction.date)}</p>
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

      {/* Floating Action Button */}
      <FloatingActionButton
        icon={Plus}
        onClick={() => setIsModalOpen(true)}
        label="Add transaction"
        className="fixed bottom-20 right-6 z-40"
      />

      {/* Add/Edit Transaction Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        title={editingTransaction ? 'Edit Transaction' : 'Add Transaction'}
        size="lg"
        enableSwipeToDismiss={true}
        enableBackdropBlur={true}
      >
        <TransactionForm
          transaction={editingTransaction || undefined}
          onSuccess={handleModalClose}
          onCancel={handleModalClose}
        />
      </Modal>

      {/* Action Menu Modal (Long Press) */}
      <Modal
        isOpen={isActionModalOpen}
        onClose={handleActionModalClose}
        title="Transaction Actions"
        size="sm"
        enableSwipeToDismiss={true}
        enableBackdropBlur={true}
      >
        {actionTransaction && (
          <div className="space-y-3">
            {/* Transaction Info */}
            <div className="p-4 bg-ios-gray-6 rounded-ios">
              <p className="text-ios-body font-semibold text-ios-label-primary">{actionTransaction.category}</p>
              {actionTransaction.description && (
                <p className="text-ios-footnote text-ios-gray-2 mt-1">{actionTransaction.description}</p>
              )}
              <p className={`text-ios-headline font-bold mt-2 ${getTransactionColorClass(actionTransaction.type)}`}>
                {actionTransaction.type === 'income' ? '+' : '-'}
                {formatCurrency(actionTransaction.baseAmount, actionTransaction.baseCurrency)}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2">
              <button
                onClick={handleEdit}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-ios-blue text-white rounded-ios font-medium text-ios-body hover:bg-ios-blue/90 active:bg-ios-blue/80 transition-colors"
              >
                <Edit className="w-5 h-5" />
                Edit Transaction
              </button>
              
              <button
                onClick={handleDelete}
                disabled={deleteTransaction.isPending}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-ios-red text-white rounded-ios font-medium text-ios-body hover:bg-ios-red/90 active:bg-ios-red/80 transition-colors disabled:opacity-50"
              >
                <Trash2 className="w-5 h-5" />
                {deleteTransaction.isPending ? 'Deleting...' : 'Delete Transaction'}
              </button>
              
              <button
                onClick={handleActionModalClose}
                className="w-full py-3 px-4 bg-ios-gray-6 text-ios-label-primary rounded-ios font-medium text-ios-body hover:bg-ios-gray-5 active:bg-ios-gray-4 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </Modal>
    </>
  )
}

