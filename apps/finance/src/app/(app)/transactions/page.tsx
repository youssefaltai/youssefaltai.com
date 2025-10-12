'use client'

import { useState } from 'react'
import { FloatingActionButton, EmptyState, Modal, Plus, CreditCard, SlidersHorizontal, PageLayout, GroupedList, LoadingSkeleton } from '@repo/ui'
import { useTransactions, useCreateTransaction, useUpdateTransaction, useDeleteTransaction } from '../../../hooks/use-transactions'
import { TransactionFilters } from '../../../components/transactions/TransactionFilters'
import { TransactionItem } from '../../../components/transactions/TransactionItem'
import { TransactionForm } from '../../../components/forms/TransactionForm'
import { cn } from '@repo/utils'
import { formatDistanceToNow, isToday, isYesterday, startOfMonth, endOfMonth, isSameMonth, parseISO } from '@repo/utils'
import { ensureDate } from '@repo/utils'

interface TransactionFilters {
  dateFrom?: string
  dateTo?: string
  fromAccountIds?: string[]
  toAccountIds?: string[]
  minAmount?: number
  maxAmount?: number
  type?: 'income' | 'expense' | 'transfer'
  search?: string
  page?: number
  limit?: number
  sortBy?: 'date' | 'amount' | 'createdAt'
  sortOrder?: 'asc' | 'desc'
}

export default function TransactionsPage() {
  // Get current month as default filter
  const now = new Date()
  const defaultStart = startOfMonth(now).toISOString()
  const defaultEnd = endOfMonth(now).toISOString()

  const [filters, setFilters] = useState<TransactionFilters>({
    dateFrom: defaultStart,
    dateTo: defaultEnd,
  })

  const { data: transactionData, isLoading } = useTransactions(filters)
  const transactions = transactionData?.data || []
  const pagination = transactionData?.pagination
  const createTransaction = useCreateTransaction()
  const updateTransaction = useUpdateTransaction()
  const deleteTransaction = useDeleteTransaction()

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isFiltersModalOpen, setIsFiltersModalOpen] = useState(false)
  const [editingTransaction, setEditingTransaction] = useState<any | null>(null)

  const handleCreate = async (data: any) => {
    await createTransaction.mutateAsync(data)
    setIsCreateModalOpen(false)
  }

  const handleUpdate = async (data: any) => {
    if (!editingTransaction) return
    await updateTransaction.mutateAsync({ id: editingTransaction.id, data })
    setEditingTransaction(null)
  }

  const handleDelete = async () => {
    if (!editingTransaction) return
    if (!confirm('Are you sure you want to delete this transaction?')) return
    await deleteTransaction.mutateAsync(editingTransaction.id)
    setEditingTransaction(null)
  }

  // Group transactions by date
  const groupedTransactions = transactions.reduce((groups, transaction) => {
    const dateObj = ensureDate(transaction.date)
    let dateLabel: string
    
    if (isToday(dateObj)) {
      dateLabel = 'Today'
    } else if (isYesterday(dateObj)) {
      dateLabel = 'Yesterday'
    } else {
      dateLabel = formatDistanceToNow(dateObj, { addSuffix: true })
    }
    
    if (!groups[dateLabel]) {
      groups[dateLabel] = []
    }
    groups[dateLabel]?.push(transaction)
    return groups
  }, {} as Record<string, typeof transactions>)

  // Check if any filters are active
  const hasActiveFilters =
    filters.search ||
    filters.minAmount ||
    filters.maxAmount ||
    filters.type ||
    (filters.dateFrom && filters.dateTo &&
      !isSameMonth(parseISO(filters.dateFrom), now))

  if (isLoading) {
    return <LoadingSkeleton title="Transactions" subtitle="View and manage your transactions" itemHeight={24} />
  }

  return (
    <PageLayout
      title="Transactions"
      subtitle="View and manage your transactions"
      headerAction={
        <button
          onClick={() => setIsFiltersModalOpen(true)}
          className={cn(
            'flex items-center gap-2 px-4 py-2 rounded-ios font-semibold text-ios-callout transition-all active:scale-95',
            hasActiveFilters
              ? 'bg-ios-blue text-white shadow-ios'
              : 'bg-white text-ios-label-primary border border-ios-gray-5'
          )}
        >
          <SlidersHorizontal className="w-4 h-4" />
          {hasActiveFilters ? `${transactions.length}` : 'Filter'}
        </button>
      }
    >
      {/* Transaction List */}
      {transactions.length === 0 ? (
        <div className="pt-16">
          <EmptyState
            icon={CreditCard}
            title="No Transactions Yet"
            description="Add your first transaction!"
          />
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedTransactions).map(([date, groupTransactions]) => (
            <div key={date}>
              {/* Date Header */}
              <h3 className="text-ios-footnote text-ios-gray-1 uppercase tracking-wide mb-2 px-2">
                {date}
              </h3>

              {/* Transactions for this date */}
              <GroupedList>
                {groupTransactions.map((transaction, index) => (
                  <TransactionItem
                    key={transaction.id}
                    transaction={transaction as any}
                    onClick={() => setEditingTransaction(transaction)}
                    isFirst={index === 0}
                    isLast={index === groupTransactions.length - 1}
                  />
                ))}
              </GroupedList>
            </div>
          ))}
        </div>
      )}

      {/* Pagination Controls */}
      {pagination && pagination.pages > 1 && (
        <div className="flex items-center justify-between mt-6 px-2">
          <button
            onClick={() => setFilters({ ...filters, page: Math.max(1, (filters.page || 1) - 1) })}
            disabled={!pagination.hasMore || (filters.page || 1) === 1}
            className="px-4 py-2 text-ios-blue font-semibold disabled:text-ios-gray-2 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          
          <span className="text-ios-body text-ios-gray-1">
            Page {pagination.page} of {pagination.pages}
          </span>
          
          <button
            onClick={() => setFilters({ ...filters, page: (filters.page || 1) + 1 })}
            disabled={!pagination.hasMore}
            className="px-4 py-2 text-ios-blue font-semibold disabled:text-ios-gray-2 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      )}

      <FloatingActionButton
        icon={Plus}
        label="Add Transaction"
        onClick={() => setIsCreateModalOpen(true)}
        className="fixed bottom-20 right-4"
      />

      {/* Filters Modal */}
      <Modal
        isOpen={isFiltersModalOpen}
        onClose={() => setIsFiltersModalOpen(false)}
        title="Filter Transactions"
      >
        <TransactionFilters
          filters={filters}
          onApply={(newFilters) => {
            setFilters(newFilters)
            setIsFiltersModalOpen(false)
          }}
          onCancel={() => setIsFiltersModalOpen(false)}
        />
      </Modal>

      {/* Create Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Add Transaction"
      >
        <TransactionForm
          onSubmit={handleCreate}
          onCancel={() => setIsCreateModalOpen(false)}
        />
      </Modal>

      {/* Edit Modal */}
      <Modal
        isOpen={!!editingTransaction}
        onClose={() => setEditingTransaction(null)}
        title="Edit Transaction"
      >
        {editingTransaction && (
          <div className="space-y-4">
            <TransactionForm
              initialData={{
                description: editingTransaction.description,
                fromAccountId: editingTransaction.fromAccount?.id || '',
                toAccountId: editingTransaction.toAccount?.id || '',
                amount: Number(editingTransaction.amount),
                currency: editingTransaction.currency,
                exchangeRate: editingTransaction.exchangeRate ? Number(editingTransaction.exchangeRate) : undefined,
                date: editingTransaction.date,
              }}
              onSubmit={handleUpdate}
              onCancel={() => setEditingTransaction(null)}
            />
            <button
              onClick={handleDelete}
              className="w-full py-3 text-ios-red font-semibold hover:bg-ios-red/10 rounded-ios transition-colors"
            >
              Delete Transaction
            </button>
          </div>
        )}
      </Modal>
    </PageLayout>
  )
}
