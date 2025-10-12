'use client'

import { useState, useEffect } from 'react'
import { Search, Button, Input } from '@repo/ui'
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
        start = new Date(now.setHours(0, 0, 0, 0))
        end = new Date(now.setHours(23, 59, 59, 999))
        break
      case 'week':
        const dayOfWeek = now.getDay()
        start = new Date(now)
        start.setDate(now.getDate() - dayOfWeek)
        start.setHours(0, 0, 0, 0)
        end = new Date(start)
        end.setDate(start.getDate() + 6)
        end.setHours(23, 59, 59, 999)
        break
      case 'month':
        start = new Date(now.getFullYear(), now.getMonth(), 1)
        end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999)
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
    const start = new Date(draftFilters.dateFrom)
    const end = new Date(draftFilters.dateTo)
    
    // Check if it's today
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59)
    if (start.toDateString() === todayStart.toDateString() && 
        end.toDateString() === todayEnd.toDateString()) {
      return 'today'
    }
    
    // Check if it's this month
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0)
    if (start.toDateString() === monthStart.toDateString() && 
        end.getMonth() === monthEnd.getMonth()) {
      return 'month'
    }
    
    return null
  }

  const currentPreset = getCurrentDatePreset()

  const handleClearAll = () => {
    const now = new Date()
    const start = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59).toISOString()
    
    setDraftFilters({
      dateFrom: start,
      dateTo: end,
    })
  }

  const hasActiveFilters =
    draftFilters.search ||
    draftFilters.minAmount ||
    draftFilters.maxAmount ||
    draftFilters.type

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
        <div className="bg-ios-gray-6 rounded-ios-sm p-0.5 flex gap-0.5">
          <button
            onClick={() => setDraftFilters({ ...draftFilters, type: undefined })}
            className={cn(
              'flex-1 py-2 rounded-[7px] font-semibold text-ios-callout transition-all',
              !draftFilters.type
                ? 'bg-white text-ios-label-primary shadow-sm'
                : 'text-ios-gray-1 hover:text-ios-label-primary'
            )}
          >
            All
          </button>
          <button
            onClick={() =>
              setDraftFilters({
                ...draftFilters,
                type: draftFilters.type === 'income' ? undefined : 'income',
              })
            }
            className={cn(
              'flex-1 py-2 rounded-[7px] font-semibold text-ios-callout transition-all',
              draftFilters.type === 'income'
                ? 'bg-white text-ios-label-primary shadow-sm'
                : 'text-ios-gray-1 hover:text-ios-label-primary'
            )}
          >
            Income
          </button>
          <button
            onClick={() =>
              setDraftFilters({
                ...draftFilters,
                type: draftFilters.type === 'expense' ? undefined : 'expense',
              })
            }
            className={cn(
              'flex-1 py-2 rounded-[7px] font-semibold text-ios-callout transition-all',
              draftFilters.type === 'expense'
                ? 'bg-white text-ios-label-primary shadow-sm'
                : 'text-ios-gray-1 hover:text-ios-label-primary'
            )}
          >
            Expense
          </button>
          <button
            onClick={() =>
              setDraftFilters({
                ...draftFilters,
                type: draftFilters.type === 'transfer' ? undefined : 'transfer',
              })
            }
            className={cn(
              'flex-1 py-2 rounded-[7px] font-semibold text-ios-callout transition-all',
              draftFilters.type === 'transfer'
                ? 'bg-white text-ios-label-primary shadow-sm'
                : 'text-ios-gray-1 hover:text-ios-label-primary'
            )}
          >
            Transfer
          </button>
        </div>
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
