'use client'

import { useState, useEffect } from 'react'
import { Search } from 'lucide-react'
import { TextInput, Button, SegmentedControl, Chip, Group, Stack, SimpleGrid, NumberInput, Text } from '@mantine/core'
import { startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, parseISO, isSameDay } from '@repo/utils'
import { useAccounts } from '../../hooks/use-accounts'

type TransactionType = 'all' | 'income' | 'expense' | 'transfer'

const TRANSACTION_TYPE_OPTIONS = [
  { value: 'all', label: 'All' },
  { value: 'income', label: 'Income' },
  { value: 'expense', label: 'Expense' },
  { value: 'transfer', label: 'Transfer' },
]

interface TransactionFilters {
  dateFrom?: string
  dateTo?: string
  fromAccountIds?: string[]
  toAccountIds?: string[]
  minAmount?: number
  maxAmount?: number
  type?: 'income' | 'expense' | 'transfer'
  search?: string
}

interface TransactionFiltersProps {
  filters: TransactionFilters
  onApply: (filters: TransactionFilters) => void
  onCancel: () => void
}

/**
 * Transaction filters form (modal-agnostic)
 * Changes are not applied until "Done" is clicked
 */
export function TransactionFilters({
  filters,
  onApply,
  onCancel,
}: TransactionFiltersProps) {
  // Local draft state - changes here don't affect parent until Done is clicked
  const [draftFilters, setDraftFilters] = useState<TransactionFilters>(filters)

  // Fetch accounts
  const { data: allAccounts = [] } = useAccounts()

  // Filter accounts based on selected transaction type
  const getFromAccountOptions = () => {
    const selectedType = draftFilters.type
    
    if (!selectedType) {
      return allAccounts // Show all when no type selected
    }
    
    switch (selectedType) {
      case 'income':
        return allAccounts.filter(a => a.type === 'income')
      case 'expense':
      case 'transfer':
        return allAccounts.filter(a => a.type === 'asset')
      default:
        return allAccounts
    }
  }

  const getToAccountOptions = () => {
    const selectedType = draftFilters.type
    
    if (!selectedType) {
      return allAccounts // Show all when no type selected
    }
    
    switch (selectedType) {
      case 'income':
        return allAccounts.filter(a => a.type === 'asset')
      case 'expense':
        return allAccounts.filter(a => a.type === 'expense')
      case 'transfer':
        return allAccounts.filter(a => a.type === 'asset')
      default:
        return allAccounts
    }
  }

  // Update draft when parent filters change (e.g., on mount)
  useEffect(() => {
    setDraftFilters(filters)
  }, [filters])

  const handleDatePreset = (preset: 'today' | 'week' | 'month' | 'all') => {
    const now = new Date()
    let start: Date
    let end: Date

    switch (preset) {
      case 'today':
        start = startOfDay(now)
        end = endOfDay(now)
        break
      case 'week':
        start = startOfWeek(now)
        end = endOfWeek(now)
        break
      case 'month':
        start = startOfMonth(now)
        end = endOfMonth(now)
        break
      case 'all':
        setDraftFilters({
          ...draftFilters,
          dateFrom: undefined,
          dateTo: undefined,
        })
        return
    }

    setDraftFilters({
      ...draftFilters,
      dateFrom: start.toISOString(),
      dateTo: end.toISOString(),
    })
  }

  const getCurrentDatePreset = (): 'today' | 'week' | 'month' | 'all' | null => {
    if (!draftFilters.dateFrom || !draftFilters.dateTo) return 'all'
    
    const now = new Date()
    const start = parseISO(draftFilters.dateFrom)
    const end = parseISO(draftFilters.dateTo)
    
    if (isSameDay(start, startOfDay(now)) && isSameDay(end, endOfDay(now))) {
      return 'today'
    }
    
    if (isSameDay(start, startOfWeek(now)) && isSameDay(end, endOfWeek(now))) {
      return 'week'
    }
    
    if (isSameDay(start, startOfMonth(now)) && isSameDay(end, endOfMonth(now))) {
      return 'month'
    }
    
    return null
  }

  const currentPreset = getCurrentDatePreset()

  const handleClearAll = () => {
    const now = new Date()
    const start = startOfMonth(now).toISOString()
    const end = endOfMonth(now).toISOString()
    
    setDraftFilters({
      dateFrom: start,
      dateTo: end,
    })
  }

  const hasActiveFilters =
    draftFilters.search ||
    draftFilters.minAmount ||
    draftFilters.maxAmount ||
    draftFilters.type ||
    (draftFilters.fromAccountIds && draftFilters.fromAccountIds.length > 0) ||
    (draftFilters.toAccountIds && draftFilters.toAccountIds.length > 0)

  const handleApply = () => {
    onApply(draftFilters)
  }

  return (
    <Stack gap="lg">
      {/* Search */}
      <div>
        <Text fw={600} size="sm" mb="sm">Search</Text>
        <TextInput
          value={draftFilters.search || ''}
          onChange={(e) =>
            setDraftFilters({ ...draftFilters, search: e.target.value || undefined })
          }
          placeholder="Search descriptions..."
          leftSection={<Search size={16} />}
        />
      </div>

      {/* Date Range */}
      <div>
        <Text fw={600} size="sm" mb="sm">Date Range</Text>
        <SimpleGrid cols={2} spacing="xs">
          <Button
            onClick={() => handleDatePreset('today')}
            variant={currentPreset === 'today' ? 'filled' : 'light'}
          >
            Today
          </Button>
          <Button
            onClick={() => handleDatePreset('week')}
            variant={currentPreset === 'week' ? 'filled' : 'light'}
          >
            This Week
          </Button>
          <Button
            onClick={() => handleDatePreset('month')}
            variant={currentPreset === 'month' ? 'filled' : 'light'}
          >
            This Month
          </Button>
          <Button
            onClick={() => handleDatePreset('all')}
            variant={currentPreset === 'all' ? 'filled' : 'light'}
          >
            All Time
          </Button>
        </SimpleGrid>
      </div>

      {/* Transaction Type */}
      <div>
        <Text fw={600} size="sm" mb="sm">Type</Text>
        <SegmentedControl
          value={(draftFilters.type || 'all') as TransactionType}
          onChange={(value) =>
            setDraftFilters({
              ...draftFilters,
              type: value === 'all' ? undefined : (value as 'income' | 'expense' | 'transfer'),
            })
          }
          data={TRANSACTION_TYPE_OPTIONS}
          fullWidth
        />
      </div>

      {/* From Accounts */}
      <div>
        <Text fw={600} size="sm" mb="sm">From Accounts</Text>
        {getFromAccountOptions().length === 0 ? (
          <Text size="sm" c="dimmed">No accounts available</Text>
        ) : (
          <Chip.Group
            multiple
            value={draftFilters.fromAccountIds || []}
            onChange={(value) => setDraftFilters({ ...draftFilters, fromAccountIds: value.length > 0 ? value : undefined })}
          >
            <Group gap="xs">
              {getFromAccountOptions().map((account) => (
                <Chip key={account.id} value={account.id}>{account.name}</Chip>
              ))}
            </Group>
          </Chip.Group>
        )}
      </div>

      {/* To Accounts */}
      <div>
        <Text fw={600} size="sm" mb="sm">To Accounts</Text>
        {getToAccountOptions().length === 0 ? (
          <Text size="sm" c="dimmed">No accounts available</Text>
        ) : (
          <Chip.Group
            multiple
            value={draftFilters.toAccountIds || []}
            onChange={(value) => setDraftFilters({ ...draftFilters, toAccountIds: value.length > 0 ? value : undefined })}
          >
            <Group gap="xs">
              {getToAccountOptions().map((account) => (
                <Chip key={account.id} value={account.id}>{account.name}</Chip>
              ))}
            </Group>
          </Chip.Group>
        )}
      </div>

      {/* Amount Range */}
      <div>
        <Text fw={600} size="sm" mb="sm">Amount Range</Text>
        <Group grow>
          <NumberInput
            value={draftFilters.minAmount}
            onChange={(val) =>
              setDraftFilters({
                ...draftFilters,
                minAmount: val ? Number(val) : undefined,
              })
            }
            placeholder="Min"
            decimalScale={2}
          />
          <NumberInput
            value={draftFilters.maxAmount}
            onChange={(val) =>
              setDraftFilters({
                ...draftFilters,
                maxAmount: val ? Number(val) : undefined,
              })
            }
            placeholder="Max"
            decimalScale={2}
          />
        </Group>
      </div>

      {/* Actions */}
      <Group justify="flex-end">
        <Button variant="default" onClick={onCancel}>
          Cancel
        </Button>
        {hasActiveFilters && (
          <Button variant="light" onClick={handleClearAll}>
            Clear All
          </Button>
        )}
        <Button onClick={handleApply}>
          Done
        </Button>
      </Group>
    </Stack>
  )
}
