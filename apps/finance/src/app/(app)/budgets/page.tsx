'use client'

import { useMemo, useState, useRef } from 'react'
import { Card, Target, PageHeader, EmptyState, FloatingActionButton, Plus, Modal, Edit, Trash2, X } from '@repo/ui'
import { formatCurrency, currentMonthRange } from '@repo/utils'
import { useBudgets } from '@/features/budgets/hooks/useBudgets'
import { useDeleteBudget } from '@/features/budgets/hooks/useDeleteBudget'
import { BudgetForm } from '@/features/budgets/components/BudgetForm'
import type { Budget } from '@repo/types'

export default function BudgetsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isActionModalOpen, setIsActionModalOpen] = useState(false)
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null)
  const [actionBudget, setActionBudget] = useState<Budget | null>(null)
  const longPressTimer = useRef<NodeJS.Timeout | null>(null)
  
  // Filter state
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [dateFrom, setDateFrom] = useState<string | null>(null)
  const [dateTo, setDateTo] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<'current-month' | 'all' | 'custom'>('current-month')

  const deleteBudget = useDeleteBudget()

  // Calculate date range based on view mode
  const { dateFromFilter, dateToFilter } = useMemo(() => {
    if (viewMode === 'current-month') {
      const { start, end } = currentMonthRange()
      return {
        dateFromFilter: start.toISOString().slice(0, 10),
        dateToFilter: end.toISOString().slice(0, 10),
      }
    }
    if (viewMode === 'custom') {
      return {
        dateFromFilter: dateFrom,
        dateToFilter: dateTo,
      }
    }
    return {
      dateFromFilter: null,
      dateToFilter: null,
    }
  }, [viewMode, dateFrom, dateTo])

  // Fetch budgets with filters
  const { data: budgets = [] } = useBudgets({
    categories: selectedCategories.length > 0 ? selectedCategories : undefined,
    dateFrom: dateFromFilter || undefined,
    dateTo: dateToFilter || undefined,
  })

  // Get unique categories from all budgets
  const availableCategories = useMemo(() => {
    const categorySet = new Set<string>()
    budgets.forEach(budget => {
      budget.categories.forEach(cat => categorySet.add(cat))
    })
    return Array.from(categorySet).sort()
  }, [budgets])

  const toggleCategoryFilter = (category: string) => {
    setSelectedCategories(prev =>
      prev.includes(category) ? prev.filter(c => c !== category) : [...prev, category]
    )
  }

  const clearCategoryFilters = () => {
    setSelectedCategories([])
  }

  const handleLongPressStart = (budget: Budget) => {
    longPressTimer.current = setTimeout(() => {
      setActionBudget(budget)
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
    if (actionBudget) {
      setEditingBudget(actionBudget)
      setIsActionModalOpen(false)
      setIsModalOpen(true)
      setActionBudget(null)
    }
  }

  const handleDelete = () => {
    if (actionBudget) {
      if (confirm(`Delete budget "${actionBudget.name}"?`)) {
        deleteBudget.mutate(actionBudget.id, {
          onSuccess: () => {
            setIsActionModalOpen(false)
            setActionBudget(null)
          },
        })
      }
    }
  }

  const handleModalClose = () => {
    setIsModalOpen(false)
    setEditingBudget(null)
  }

  const handleActionModalClose = () => {
    setIsActionModalOpen(false)
    setActionBudget(null)
  }

  const getProgressPercentage = (spent: number, amount: number) => {
    return Math.min((spent / amount) * 100, 100)
  }

  const getProgressColor = (percentage: number) => {
    if (percentage >= 100) return 'bg-ios-red'
    if (percentage >= 80) return 'bg-ios-orange'
    if (percentage >= 60) return 'bg-ios-yellow'
    return 'bg-ios-green'
  }

  const hasActiveFilters = selectedCategories.length > 0

  return (
    <>
      <PageHeader title="Budgets" subtitle="Track your spending limits" />

      {/* View Mode Selector */}
      <div className="px-4 mb-4 flex gap-2">
        {(['current-month', 'all', 'custom'] as const).map((mode) => (
          <button
            key={mode}
            onClick={() => setViewMode(mode)}
            className={`px-4 py-2 rounded-full text-ios-callout font-medium transition-all ${
              viewMode === mode
                ? 'bg-ios-blue text-white'
                : 'bg-white text-ios-gray-1 border border-ios-gray-5'
            }`}
          >
            {mode === 'current-month' ? 'This Month' : mode === 'all' ? 'All' : 'Custom'}
          </button>
        ))}
      </div>

      {/* Custom Date Range (only show when custom mode selected) */}
      {viewMode === 'custom' && (
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
      )}

      {/* Category Filter Chips */}
      {availableCategories.length > 0 && (
        <div className="px-4 mb-4">
          <div className="flex items-center justify-between mb-2">
            <label className="text-ios-footnote text-ios-gray-1 ml-1">Filter by Categories</label>
            {selectedCategories.length > 0 && (
              <button
                onClick={clearCategoryFilters}
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
                  onClick={() => toggleCategoryFilter(category)}
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

      {/* Clear Filters Button */}
      {hasActiveFilters && (
        <div className="px-4 mb-4">
          <button
            onClick={clearCategoryFilters}
            className="flex items-center gap-2 px-4 py-2 text-ios-callout font-medium text-ios-red hover:bg-ios-red/10 rounded-ios transition-colors"
          >
            <X className="w-4 h-4" />
            Clear Filters
          </button>
        </div>
      )}

      {/* Budgets List */}
      <div className="px-4 mb-6">
        {budgets.length === 0 ? (
          <EmptyState
            icon={Target}
            title="No budgets found"
            description="Create a budget to track your spending"
          />
        ) : (
          <div className="space-y-4">
            {budgets.map((budget) => {
              const percentage = getProgressPercentage(budget.spent || 0, budget.amount)
              const progressColor = getProgressColor(percentage)
              const isOverBudget = (budget.spent || 0) > budget.amount

              return (
                <Card key={budget.id} padding="md">
                  <div
                    onTouchStart={() => handleLongPressStart(budget)}
                    onTouchEnd={handleLongPressEnd}
                    onTouchCancel={handleLongPressEnd}
                    onMouseDown={() => handleLongPressStart(budget)}
                    onMouseUp={handleLongPressEnd}
                    onMouseLeave={handleLongPressEnd}
                    className="w-full text-left cursor-pointer"
                  >
                    {/* Budget Header */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="text-ios-headline font-bold text-ios-label-primary">
                          {budget.name}
                        </h3>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {budget.categories.map((cat) => (
                            <span
                              key={cat}
                              className="px-2 py-1 bg-ios-gray-6 text-ios-footnote text-ios-gray-1 rounded"
                            >
                              {cat}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="text-right ml-4">
                        <p className="text-ios-title3 font-bold text-ios-label-primary">
                          {formatCurrency(budget.amount, budget.currency)}
                        </p>
                        <p className="text-ios-footnote text-ios-gray-1">
                          {new Date(budget.startDate).toLocaleDateString()} - {new Date(budget.endDate).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="mb-2">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-ios-footnote text-ios-gray-1">
                          {formatCurrency(budget.spent || 0, budget.currency)} spent
                        </span>
                        <span className={`text-ios-footnote font-medium ${
                          isOverBudget ? 'text-ios-red' : 'text-ios-gray-1'
                        }`}>
                          {percentage.toFixed(0)}%
                        </span>
                      </div>
                      <div className="h-2 bg-ios-gray-6 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${progressColor} transition-all duration-300`}
                          style={{ width: `${Math.min(percentage, 100)}%` }}
                        />
                      </div>
                    </div>

                    {/* Remaining Amount */}
                    <div className="flex items-center justify-between">
                      <span className="text-ios-footnote text-ios-gray-1">Remaining</span>
                      <span className={`text-ios-callout font-semibold ${
                        isOverBudget ? 'text-ios-red' : 'text-ios-green'
                      }`}>
                        {isOverBudget ? '-' : ''}
                        {formatCurrency(Math.abs(budget.remaining || 0), budget.currency)}
                      </span>
                    </div>
                  </div>
                </Card>
              )
            })}
          </div>
        )}
      </div>

      {/* Floating Action Button */}
      <FloatingActionButton
        icon={Plus}
        onClick={() => setIsModalOpen(true)}
        label="Add budget"
        className="fixed bottom-20 right-6 z-40"
      />

      {/* Add/Edit Budget Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        title={editingBudget ? 'Edit Budget' : 'Create Budget'}
      >
        <BudgetForm
          budget={editingBudget || undefined}
          onSuccess={handleModalClose}
          onCancel={handleModalClose}
        />
      </Modal>

      {/* Action Menu Modal */}
      <Modal
        isOpen={isActionModalOpen}
        onClose={handleActionModalClose}
        title="Budget Actions"
      >
        {actionBudget && (
          <div className="space-y-3">
            {/* Budget Info */}
            <div className="p-4 bg-ios-gray-6 rounded-ios">
              <p className="text-ios-body font-semibold text-ios-label-primary">
                {actionBudget.name}
              </p>
              <p className="text-ios-footnote text-ios-gray-2 mt-1">
                {actionBudget.categories.join(', ')}
              </p>
              <p className="text-ios-headline font-bold mt-2 text-ios-label-primary">
                {formatCurrency(actionBudget.amount, actionBudget.currency)}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2">
              <button
                onClick={handleEdit}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-ios-blue text-white rounded-ios font-medium text-ios-body hover:bg-ios-blue/90 active:bg-ios-blue/80 transition-colors"
              >
                <Edit className="w-5 h-5" />
                Edit Budget
              </button>
              
              <button
                onClick={handleDelete}
                disabled={deleteBudget.isPending}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-ios-red text-white rounded-ios font-medium text-ios-body hover:bg-ios-red/90 active:bg-ios-red/80 transition-colors disabled:opacity-50"
              >
                <Trash2 className="w-5 h-5" />
                {deleteBudget.isPending ? 'Deleting...' : 'Delete Budget'}
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
