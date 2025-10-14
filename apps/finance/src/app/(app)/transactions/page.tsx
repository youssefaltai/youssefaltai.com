'use client'

import { useState } from 'react'
import { Plus, CreditCard, SlidersHorizontal } from 'lucide-react'
import { Container, Stack, ActionIcon, Modal, Title, Text, Group, Paper, Skeleton, Button } from '@mantine/core'
import { useTransactions, useCreateTransaction, useUpdateTransaction, useDeleteTransaction } from '../../../hooks/use-transactions'
import { TransactionFilters } from '../../../components/transactions/TransactionFilters'
import { TransactionItem } from '../../../components/transactions/TransactionItem'
import { TransactionForm } from '../../../components/forms/TransactionForm'
import { formatDistanceToNow, isToday, isYesterday, startOfMonth, endOfMonth, isSameMonth, parseISO } from '@repo/utils'
import { ensureDate } from '@repo/utils'
import type { TTransaction } from '@repo/db'
import type { CreateTransactionSchema, UpdateTransactionSchema } from '../../../features/transactions/validation'

interface TransactionFiltersType {
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

  const [filters, setFilters] = useState<TransactionFiltersType>({
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
  const [editingTransaction, setEditingTransaction] = useState<TTransaction | null>(null)

  const handleCreate = async (data: CreateTransactionSchema) => {
    await createTransaction.mutateAsync(data)
    setIsCreateModalOpen(false)
  }

  const handleUpdate = async (data: UpdateTransactionSchema) => {
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
    return (
      <Container size="lg" py="md" px="md" pb={96}>
        <Stack gap="md">
          <Skeleton height={80} radius="md" />
          <Skeleton height={80} radius="md" />
          <Skeleton height={80} radius="md" />
        </Stack>
      </Container>
    )
  }

  return (
    <Container size="lg" py="md" px="md" pb={96}>
      <Stack gap="md">
        <Group justify="space-between" align="flex-start">
          <div>
            <Title order={1} size="h2">Transactions</Title>
            <Text c="dimmed" size="sm">View and manage your transactions</Text>
          </div>
          <Button
            onClick={() => setIsFiltersModalOpen(true)}
            variant={hasActiveFilters ? 'filled' : 'default'}
            leftSection={<SlidersHorizontal size={16} />}
          >
            {hasActiveFilters ? `${transactions.length}` : 'Filter'}
          </Button>
        </Group>

        {transactions.length === 0 ? (
          <Stack align="center" gap="md" py="xl" style={{ textAlign: 'center', paddingTop: '4rem' }}>
            <CreditCard size={64} style={{ opacity: 0.3 }} />
            <Title order={3} size="h4">No Transactions Yet</Title>
            <Text c="dimmed">Add your first transaction!</Text>
          </Stack>
        ) : (
          <Stack gap="xl">
            {Object.entries(groupedTransactions).map(([date, groupTransactions]) => (
              <div key={date}>
                <Text
                  size="xs"
                  c="dimmed"
                  tt="uppercase"
                  fw={600}
                  mb="xs"
                  px="xs"
                >
                  {date}
                </Text>
                <Paper withBorder radius="md">
                  <Stack gap={0}>
                    {groupTransactions.map((transaction, index) => (
                      <TransactionItem
                        key={transaction.id}
                        transaction={transaction}
                        onClick={() => setEditingTransaction(transaction)}
                        isFirst={index === 0}
                        isLast={index === groupTransactions.length - 1}
                      />
                    ))}
                  </Stack>
                </Paper>
              </div>
            ))}
          </Stack>
        )}

        {/* Pagination Controls */}
        {pagination && pagination.pages > 1 && (
          <Group justify="space-between" mt="lg" px="xs">
            <Button
              onClick={() => setFilters({ ...filters, page: Math.max(1, (filters.page || 1) - 1) })}
              disabled={!pagination.hasMore || (filters.page || 1) === 1}
              variant="default"
            >
              Previous
            </Button>
            
            <Text size="sm" c="dimmed">
              Page {pagination.page} of {pagination.pages}
            </Text>
            
            <Button
              onClick={() => setFilters({ ...filters, page: (filters.page || 1) + 1 })}
              disabled={!pagination.hasMore}
              variant="default"
            >
              Next
            </Button>
          </Group>
        )}
      </Stack>

      <ActionIcon
        onClick={() => setIsCreateModalOpen(true)}
        size="xl"
        radius="xl"
        variant="filled"
        color="blue"
        aria-label="Add Transaction"
        style={{
          position: 'fixed',
          bottom: '5rem',
          right: '1rem',
          width: '56px',
          height: '56px',
          zIndex: 100,
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
        }}
      >
        <Plus size={24} />
      </ActionIcon>

      <Modal
        opened={isFiltersModalOpen}
        onClose={() => setIsFiltersModalOpen(false)}
        title="Filter Transactions"
        centered
        size="md"
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

      <Modal
        opened={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Add Transaction"
        centered
        size="md"
      >
        <TransactionForm
          onSubmit={handleCreate}
          onCancel={() => setIsCreateModalOpen(false)}
        />
      </Modal>

      <Modal
        opened={!!editingTransaction}
        onClose={() => setEditingTransaction(null)}
        title="Edit Transaction"
        centered
        size="md"
      >
        {editingTransaction && (
          <Stack gap="md">
            <TransactionForm
              initialData={{
                description: editingTransaction.description || undefined,
                fromAccountId: editingTransaction.fromAccount?.id || '',
                toAccountId: editingTransaction.toAccount?.id || '',
                amount: Number(editingTransaction.amount),
                currency: editingTransaction.currency,
                exchangeRate: editingTransaction.exchangeRate ? Number(editingTransaction.exchangeRate) : undefined,
                date: new Date(editingTransaction.date).toISOString(),
              }}
              onSubmit={handleUpdate}
              onCancel={() => setEditingTransaction(null)}
            />
            <Button
              onClick={handleDelete}
              color="red"
              variant="light"
              fullWidth
            >
              Delete Transaction
            </Button>
          </Stack>
        )}
      </Modal>
    </Container>
  )
}
