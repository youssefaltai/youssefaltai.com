'use client'

import { Card, ProgressBar, ChevronRight, Money } from '@repo/ui'
import { calculateGoalProgress } from '../../utils/calculations'
import { useRouter } from 'next/navigation'
import type { Account } from '@repo/db'

interface GoalsProgressProps {
  goals: Account[]
}

/**
 * Dashboard section showing progress for active goals
 * Displays top 3 goals with progress bars
 */
export function GoalsProgress({ goals }: GoalsProgressProps) {
  const router = useRouter()

  // Take top 3 goals
  const topGoals = goals.slice(0, 3)

  if (topGoals.length === 0) {
    return null
  }

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between px-2">
        <h2 className="text-ios-title-3 font-semibold text-ios-label-primary">
          Your Goals
        </h2>
        <button
          onClick={() => router.push('/goals')}
          className="flex items-center gap-1 text-ios-blue text-ios-body hover:opacity-70 transition-opacity"
        >
          <span>View All</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Goals List */}
      <Card padding="none">
        {topGoals.map((goal, index) => {
          const progress = goal.target
            ? calculateGoalProgress(Number(goal.balance), Number(goal.target))
            : 0

          return (
            <div
              key={goal.id}
              className={cn(
                'p-4',
                index < topGoals.length - 1 && 'border-b border-ios-gray-5'
              )}
            >
              <div className="flex items-start justify-between mb-2">
                <h3 className="text-ios-body font-semibold text-ios-label-primary">
                  {goal.name}
                </h3>
                <span className="text-ios-body text-ios-blue font-semibold">
                  {Math.round(progress)}%
                </span>
              </div>

              <ProgressBar value={progress} className="mb-2" />

              <p className="text-ios-footnote text-ios-gray-1">
                <Money amount={Number(goal.balance)} currency={goal.currency} /> of{' '}
                <Money amount={Number(goal.target)} currency={goal.currency} />
              </p>
            </div>
          )
        })}
      </Card>
    </div>
  )
}

// Helper import
import { cn } from '@repo/utils'

