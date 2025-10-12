'use client'

import { Money, ProgressBar } from '@repo/ui'
import { format } from '@repo/utils'
import { cn } from '@repo/utils'
import { useBudgetProgress } from '../../hooks/use-budget-progress'
import type { Currency } from '@repo/db'

interface Budget {
  id: string
  name: string
  amount: string
  currency: string
  startDate: string
  endDate: string
  accounts: Array<{
    account: {
      id: string
      name: string
    }
  }>
}

interface BudgetCardProps {
  budget: Budget
  onClick?: () => void
  isFirst?: boolean
  isLast?: boolean
}

/**
 * Display item for a budget in a grouped list
 * Shows name, amount, date range, progress bar, and expense categories
 */
export function BudgetCard({ budget, onClick, isFirst, isLast }: BudgetCardProps) {
  const { data: progress, isLoading } = useBudgetProgress(budget.id)

  const percentage = progress?.percentage || 0
  const isOverBudget = progress?.isOverBudget || false

  // Color coding based on percentage
  const getProgressColor = () => {
    if (isOverBudget) return 'bg-ios-red'
    if (percentage >= 80) return 'bg-ios-orange'
    return 'bg-ios-green'
  }

  const formatDateRange = () => {
    const start = new Date(budget.startDate)
    const end = new Date(budget.endDate)
    return `${format(start, 'MMM d')} - ${format(end, 'MMM d, yyyy')}`
  }

  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full px-4 py-3 text-left',
        'hover:bg-ios-gray-6 active:bg-ios-gray-5 transition-colors',
        !isLast && 'border-b border-ios-gray-5',
        isFirst && 'rounded-t-ios',
        isLast && 'rounded-b-ios'
      )}
    >
      <div className="space-y-3">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="text-ios-headline font-semibold text-ios-label-primary">
              {budget.name}
            </h3>
            <p className="text-ios-footnote text-ios-gray-1 mt-1">
              {formatDateRange()}
            </p>
          </div>
          <div className="text-right">
            <Money
              amount={Number(budget.amount)}
              currency={budget.currency as Currency}
              className="text-ios-headline font-semibold"
            />
          </div>
        </div>

        {/* Progress */}
        {isLoading ? (
          <div className="h-2 bg-ios-gray-5 rounded-full animate-pulse" />
        ) : progress ? (
          <div className="space-y-2">
            <div className="relative">
              <ProgressBar value={Math.min(percentage, 100)} />
              <div
                className={cn(
                  'absolute inset-0 rounded-full',
                  getProgressColor(),
                  'transition-all duration-300'
                )}
                style={{ width: `${Math.min(percentage, 100)}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-ios-footnote">
              <span className="text-ios-gray-1">
                <Money amount={progress.spent} currency={progress.budgetCurrency as Currency} /> spent
              </span>
              <span
                className={cn(
                  'font-semibold',
                  isOverBudget ? 'text-ios-red' : 'text-ios-label-primary'
                )}
              >
                {isOverBudget ? (
                  <>
                    +<Money amount={Math.abs(progress.remaining)} currency={progress.budgetCurrency as Currency} /> over
                  </>
                ) : (
                  <>
                    <Money amount={progress.remaining} currency={progress.budgetCurrency as Currency} /> left
                  </>
                )}
              </span>
            </div>
          </div>
        ) : null}

        {/* Expense Categories */}
        {budget.accounts.length > 0 && (
          <div className="pt-2 border-t border-ios-gray-5">
            <p className="text-ios-caption text-ios-gray-2 mb-1">Categories:</p>
            <div className="flex flex-wrap gap-1">
              {budget.accounts.map((ba) => (
                <span
                  key={ba.account.id}
                  className="text-ios-caption text-ios-label-secondary bg-ios-gray-6 px-2 py-1 rounded-full"
                >
                  {ba.account.name}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </button>
  )
}

