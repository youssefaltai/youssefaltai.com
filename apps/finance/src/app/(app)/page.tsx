'use client'

import { ChevronRight, PageHeader, ProgressBar } from '@repo/ui'
import { useRouter } from 'next/navigation'
import { TransactionItem } from '../../components/transactions/TransactionItem'
import { GroupedList } from '../../components/shared/GroupedList'
import { useDashboardSummary, useRecentTransactions, useActiveGoals } from '../../hooks/use-dashboard'
import { TTransaction } from '@repo/db'
import { formatCurrency } from '../../utils/format'
import { calculateGoalProgress } from '../../utils/calculations'
import { cn, getGreeting } from '@repo/utils'

export default function HomePage() {
  const router = useRouter()
  const { data: summary } = useDashboardSummary()
  const { data: recentTransactions = [] } = useRecentTransactions(5)
  const { data: activeGoals = [] } = useActiveGoals()

  return (
    <div className="min-h-screen pb-24">
      {/* Hero Section - Net Worth */}
      <div className="px-4 pt-6 pb-6">
        <PageHeader
          title={`Good ${getGreeting()}`}
          subtitle="Here's a quick overview of your finances."
        />
        <div className="bg-white rounded-ios-lg p-6 shadow-ios-lg border border-ios-gray-5">
          <p className="text-ios-callout text-ios-gray-1 mb-1">Net Worth</p>
          <p className="text-5xl font-bold text-ios-label-primary mb-4">
            {summary ? `EGP ${summary.netWorth.toLocaleString()}` : '—'}
          </p>

          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-ios-gray-5">
            <div>
              <p className="text-ios-caption text-ios-gray-2 mb-1">Income</p>
              <p className="text-ios-body font-semibold text-ios-label-primary">
                {summary ? `${summary.thisMonthIncome.toLocaleString()}` : '—'}
              </p>
            </div>
            <div>
              <p className="text-ios-caption text-ios-gray-2 mb-1">Expenses</p>
              <p className="text-ios-body font-semibold text-ios-label-primary">
                {summary ? `${summary.thisMonthExpenses.toLocaleString()}` : '—'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="px-4 space-y-6">
        {/* Goals Progress */}
        {activeGoals.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-ios-title-3 font-semibold text-ios-label-primary">
                Your Goals
              </h2>
              <button
                onClick={() => router.push('/goals')}
                className="flex items-center gap-1 text-ios-blue text-ios-body hover:opacity-70 transition-opacity"
              >
                <span>See All</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <GroupedList>
              {activeGoals.slice(0, 3).map((goal, index) => {
                const progress = goal.target
                  ? calculateGoalProgress(Number(goal.balance), Number(goal.target))
                  : 0

                return (
                  <button
                    key={goal.id}
                    onClick={() => router.push('/goals')}
                    className={cn(
                      'w-full p-4 text-left hover:bg-ios-gray-6 active:bg-ios-gray-5 transition-colors',
                      index < activeGoals.slice(0, 3).length - 1 && 'border-b border-ios-gray-5',
                      index === 0 && 'rounded-t-ios',
                      index === activeGoals.slice(0, 3).length - 1 && 'rounded-b-ios'
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
                      {formatCurrency(Number(goal.balance), goal.currency)} of{' '}
                      {formatCurrency(Number(goal.target), goal.currency)}
                    </p>
                  </button>
                )
              })}
            </GroupedList>
          </div>
        )}

        {/* Recent Transactions */}
        {recentTransactions.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-ios-title-3 font-semibold text-ios-label-primary">
                Recent Activity
              </h2>
              <button
                onClick={() => router.push('/transactions')}
                className="flex items-center gap-1 text-ios-blue text-ios-body hover:opacity-70 transition-opacity"
              >
                <span>See All</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <GroupedList>
              {recentTransactions.slice(0, 5).map((transaction: TTransaction, index: number) => (
                <TransactionItem
                  key={transaction.id}
                  transaction={transaction}
                  onClick={() => router.push('/transactions')}
                  isFirst={index === 0}
                  isLast={index === recentTransactions.slice(0, 5).length - 1}
                />
              ))}
            </GroupedList>
          </div>
        )}
      </div>
    </div>
  )
}
