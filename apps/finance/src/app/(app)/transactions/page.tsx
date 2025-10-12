'use client'

import { useState } from 'react'
import { FloatingActionButton, EmptyState, Modal, Plus, CreditCard, SlidersHorizontal } from '@repo/ui'
import { useTransactions, useCreateTransaction, useUpdateTransaction, useDeleteTransaction } from '../../../hooks/use-transactions'
import { TransactionFilters } from '../../../components/transactions/TransactionFilters'
import { TransactionItem } from '../../../components/transactions/TransactionItem'
import { TransactionForm } from '../../../components/forms/TransactionForm'
import { PageLayout } from '../../../components/shared/PageLayout'
import { GroupedList } from '../../../components/shared/GroupedList'
import { LoadingSkeleton } from '../../../components/shared/LoadingSkeleton'
import { formatDate } from '../../../utils/format'
import { cn } from '@repo/utils'

interface TransactionFilters {
  dateFrom?: string
  dateTo?: string
  accountIds?: string[]
  minAmount?: number
  maxAmount?: number
  type?: 'income' | 'expense' | 'transfer'
  search?: string
}

export default function TransactionsPage() {
  // Get current month as default filter
  const now = new Date()
  const defaultStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
  const defaultEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59).toISOString()

  const [filters, setFilters] = useState<TransactionFilters>({
    dateFrom: defaultStart,
    dateTo: defaultEnd,
  })

  const { data: transactions = [], isLoading } = useTransactions(filters)
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
    const date = formatDate(transaction.date, 'relative')
    if (!groups[date]) {
      groups[date] = []
    }
    groups[date].push(transaction)
    return groups
  }, {} as Record<string, typeof transactions>)

  // Check if any filters are active
  const hasActiveFilters =
    filters.search ||
    filters.minAmount ||
    filters.maxAmount ||
    filters.type ||
    (filters.dateFrom && filters.dateTo &&
      (new Date(filters.dateFrom).getMonth() !== now.getMonth() ||
        new Date(filters.dateFrom).getFullYear() !== now.getFullYear()))

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
              initialData={editingTransaction}
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
