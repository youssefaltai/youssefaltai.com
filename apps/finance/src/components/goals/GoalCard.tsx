'use client'

import { ProgressBar } from '@repo/ui'
import { formatCurrency, formatDate } from '../../utils/format'
import { calculateGoalProgress, formatDueDateStatus } from '../../utils/calculations'
import type { Account } from '@repo/db'
import { cn } from '@repo/utils'

interface GoalCardProps {
  goal: Account
  onClick?: () => void
  isFirst?: boolean
  isLast?: boolean
}

/**
 * Display item for a goal in a grouped list
 * Shows name, progress, target amount, and due date
 */
export function GoalCard({ goal, onClick, isFirst, isLast }: GoalCardProps) {
  const progress = goal.target
    ? calculateGoalProgress(Number(goal.balance), Number(goal.target))
    : 0

  const isCompleted = progress >= 100

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
              {goal.name}
            </h3>
            {goal.description && (
              <p className="text-ios-footnote text-ios-gray-1 mt-1">
                {goal.description}
              </p>
            )}
          </div>
          {isCompleted && (
            <span className="text-ios-green text-ios-caption font-semibold">
              COMPLETED
            </span>
          )}
        </div>

        {/* Progress */}
        <div className="space-y-2">
          <ProgressBar value={progress} />
          <div className="flex items-center justify-between text-ios-footnote">
            <span className="text-ios-gray-1">
              {formatCurrency(Number(goal.balance), goal.currency)} of{' '}
              {formatCurrency(Number(goal.target), goal.currency)}
            </span>
            <span className="text-ios-label-primary font-semibold">
              {Math.round(progress)}%
            </span>
          </div>
        </div>

        {/* Due date */}
        {goal.dueDate && (
          <div className="flex items-center justify-between pt-2 border-t border-ios-gray-5">
            <span className="text-ios-footnote text-ios-gray-1">
              {formatDueDateStatus(goal.dueDate)}
            </span>
            <span className="text-ios-footnote text-ios-gray-2">
              {formatDate(goal.dueDate, 'short')}
            </span>
          </div>
        )}
      </div>
    </button>
  )
}

