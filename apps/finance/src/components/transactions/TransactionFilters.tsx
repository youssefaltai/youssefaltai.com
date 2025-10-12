'use client'

import { useState, useEffect } from 'react'
import { Search, Button, Input, SegmentedControl, ChipSelect } from '@repo/ui'
import type { SegmentedControlOption, ChipSelectOption } from '@repo/ui'
import { cn } from '@repo/utils'
import { startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, parseISO, isSameDay } from '@repo/utils'
import { useAccounts } from '../../hooks/use-accounts'

type TransactionType = 'all' | 'income' | 'expense' | 'transfer'

const TRANSACTION_TYPE_OPTIONS: SegmentedControlOption<TransactionType>[] = [
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

  // Transform accounts to chip options
  const accountOptions: ChipSelectOption[] = allAccounts.map(account => ({
    id: account.id,
    label: account.name,
  }))

  // Filter accounts based on selected transaction type
  const getFromAccountOptions = (): ChipSelectOption[] => {
    const selectedType = draftFilters.type
    
    if (!selectedType) {
      return accountOptions // Show all when no type selected
    }
    
    switch (selectedType) {
      case 'income':
        // Income transactions: FROM income accounts
        return accountOptions.filter(opt => {
          const account = allAccounts.find(a => a.id === opt.id)
          return account?.type === 'income'
        })
      case 'expense':
        // Expense transactions: FROM asset accounts
        return accountOptions.filter(opt => {
          const account = allAccounts.find(a => a.id === opt.id)
          return account?.type === 'asset'
        })
      case 'transfer':
        // Transfer transactions: FROM asset accounts
        return accountOptions.filter(opt => {
          const account = allAccounts.find(a => a.id === opt.id)
          return account?.type === 'asset'
        })
      default:
        return accountOptions
    }
  }

  const getToAccountOptions = (): ChipSelectOption[] => {
    const selectedType = draftFilters.type
    
    if (!selectedType) {
      return accountOptions // Show all when no type selected
    }
    
    switch (selectedType) {
      case 'income':
        // Income transactions: TO asset accounts
        return accountOptions.filter(opt => {
          const account = allAccounts.find(a => a.id === opt.id)
          return account?.type === 'asset'
        })
      case 'expense':
        // Expense transactions: TO expense accounts
        return accountOptions.filter(opt => {
          const account = allAccounts.find(a => a.id === opt.id)
          return account?.type === 'expense'
        })
      case 'transfer':
        // Transfer transactions: TO asset accounts
        return accountOptions.filter(opt => {
          const account = allAccounts.find(a => a.id === opt.id)
          return account?.type === 'asset'
        })
      default:
        return accountOptions
    }
  }

  // Update draft when parent filters change (e.g., on mount)
  useEffect(() => {
    setDraftFilters(filters)
  }, [filters])

  const handleFromAccountToggle = (accountId: string) => {
    const current = draftFilters.fromAccountIds || []
    const updated = current.includes(accountId)
      ? current.filter(id => id !== accountId)
      : [...current, accountId]
    setDraftFilters({
      ...draftFilters,
      fromAccountIds: updated.length > 0 ? updated : undefined
    })
  }

  const handleToAccountToggle = (accountId: string) => {
    const current = draftFilters.toAccountIds || []
    const updated = current.includes(accountId)
      ? current.filter(id => id !== accountId)
      : [...current, accountId]
    setDraftFilters({
      ...draftFilters,
      toAccountIds: updated.length > 0 ? updated : undefined
    })
  }

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
    
    // Check if it's today
    if (isSameDay(start, startOfDay(now)) && isSameDay(end, endOfDay(now))) {
      return 'today'
    }
    
    // Check if it's this week
    if (isSameDay(start, startOfWeek(now)) && isSameDay(end, endOfWeek(now))) {
      return 'week'
    }
    
    // Check if it's this month
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
    <div className="space-y-6">
      {/* Search */}
      <div>
        <label className="text-ios-callout font-semibold text-ios-label-primary block mb-3">
          Search
        </label>
        <div className="relative">
          <div className="absolute left-3 top-3 pointer-events-none z-10">
            <Search className="w-5 h-5 text-ios-gray-2" />
          </div>
          <input
            type="text"
            value={draftFilters.search || ''}
            onChange={(e) =>
              setDraftFilters({ ...draftFilters, search: e.target.value || undefined })
            }
            placeholder="Search descriptions..."
            className="w-full h-11 pl-10 pr-4 bg-ios-gray-6 rounded-ios text-ios-body text-ios-label-primary placeholder:text-ios-gray-2 focus:outline-none focus:ring-2 focus:ring-ios-blue focus:bg-white transition-all"
          />
        </div>
      </div>

      {/* Date Range */}
      <div>
        <label className="text-ios-callout font-semibold text-ios-label-primary block mb-3">
          Date Range
        </label>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => handleDatePreset('today')}
            className={cn(
              'py-3 rounded-ios font-semibold text-ios-callout transition-all active:scale-95',
              currentPreset === 'today'
                ? 'bg-ios-blue text-white shadow-ios'
                : 'bg-ios-gray-6 text-ios-label-primary'
            )}
          >
            Today
          </button>
          <button
            onClick={() => handleDatePreset('week')}
            className={cn(
              'py-3 rounded-ios font-semibold text-ios-callout transition-all active:scale-95',
              currentPreset === 'week'
                ? 'bg-ios-blue text-white shadow-ios'
                : 'bg-ios-gray-6 text-ios-label-primary'
            )}
          >
            This Week
          </button>
          <button
            onClick={() => handleDatePreset('month')}
            className={cn(
              'py-3 rounded-ios font-semibold text-ios-callout transition-all active:scale-95',
              currentPreset === 'month'
                ? 'bg-ios-blue text-white shadow-ios'
                : 'bg-ios-gray-6 text-ios-label-primary'
            )}
          >
            This Month
          </button>
          <button
            onClick={() => handleDatePreset('all')}
            className={cn(
              'py-3 rounded-ios font-semibold text-ios-callout transition-all active:scale-95',
              currentPreset === 'all'
                ? 'bg-ios-blue text-white shadow-ios'
                : 'bg-ios-gray-6 text-ios-label-primary'
            )}
          >
            All Time
          </button>
        </div>
      </div>

      {/* Transaction Type */}
      <div>
        <label className="text-ios-callout font-semibold text-ios-label-primary block mb-3">
          Type
        </label>
        <SegmentedControl
          options={TRANSACTION_TYPE_OPTIONS}
          value={(draftFilters.type || 'all') as TransactionType}
          onChange={(value) =>
            setDraftFilters({
              ...draftFilters,
              type: value === 'all' ? undefined : value,
            })
          }
        />
      </div>

      {/* From Accounts */}
      <div>
        <label className="text-ios-callout font-semibold text-ios-label-primary block mb-3">
          From Accounts
        </label>
        <ChipSelect
          options={getFromAccountOptions()}
          selectedIds={draftFilters.fromAccountIds || []}
          onToggle={handleFromAccountToggle}
          emptyMessage="No accounts available"
        />
      </div>

      {/* To Accounts */}
      <div>
        <label className="text-ios-callout font-semibold text-ios-label-primary block mb-3">
          To Accounts
        </label>
        <ChipSelect
          options={getToAccountOptions()}
          selectedIds={draftFilters.toAccountIds || []}
          onToggle={handleToAccountToggle}
          emptyMessage="No accounts available"
        />
      </div>

      {/* Amount Range */}
      <div>
        <label className="text-ios-callout font-semibold text-ios-label-primary block mb-3">
          Amount Range
        </label>
        <div className="grid grid-cols-2 gap-3">
          <Input
            type="number"
            value={draftFilters.minAmount || ''}
            onChange={(e) =>
              setDraftFilters({
                ...draftFilters,
                minAmount: e.target.value ? parseFloat(e.target.value) : undefined,
              })
            }
            placeholder="Min"
            step="0.01"
          />
          <Input
            type="number"
            value={draftFilters.maxAmount || ''}
            onChange={(e) =>
              setDraftFilters({
                ...draftFilters,
                maxAmount: e.target.value ? parseFloat(e.target.value) : undefined,
              })
            }
            placeholder="Max"
            step="0.01"
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-2">
        <Button
          variant="secondary"
          onClick={onCancel}
          className="flex-1"
        >
          Cancel
        </Button>
        {hasActiveFilters && (
          <Button
            variant="plain"
            onClick={handleClearAll}
            className="flex-1"
          >
            Clear All
          </Button>
        )}
        <Button
          variant="primary"
          onClick={handleApply}
          className="flex-1"
        >
          Done
        </Button>
      </div>
    </div>
  )
}
