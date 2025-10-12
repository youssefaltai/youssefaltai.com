'use client'

import { useState } from 'react'
import { ChevronRight, PageHeader, ProgressBar, Settings, Money, Modal, GroupedList } from '@repo/ui'
import { useRouter } from 'next/navigation'
import { TransactionItem } from '../../components/transactions/TransactionItem'
import { useDashboardSummary, useRecentTransactions, useActiveGoals } from '../../hooks/use-dashboard'
import { useIsWidgetVisible } from '../../hooks/use-widget-preferences'
import { TTransaction } from '@repo/db'
import { calculateGoalProgress } from '../../utils/calculations'
import { cn, getGreeting, format, parseISO } from '@repo/utils'
import { AlertsWidget } from '../../components/dashboard/AlertsWidget'
import { FinancialHealthWidget } from '../../components/dashboard/FinancialHealthWidget'
import { SpendingTrendsChart } from '../../components/dashboard/SpendingTrendsChart'
import { CategoryBreakdownChart } from '../../components/dashboard/CategoryBreakdownChart'
import { MonthComparisonWidget } from '../../components/dashboard/MonthComparisonWidget'
import { QuickStatsWidget } from '../../components/dashboard/QuickStatsWidget'
import { AccountBalancesWidget } from '../../components/dashboard/AccountBalancesWidget'
import { InsightsWidget } from '../../components/dashboard/InsightsWidget'
import { WidgetSettings } from '../../components/dashboard/WidgetSettings'
import { MonthSelector } from '../../components/dashboard/MonthSelector'

export default function HomePage() {
  const router = useRouter()
  const [selectedMonth, setSelectedMonth] = useState<string | undefined>(undefined)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  
  const { data: summary } = useDashboardSummary(selectedMonth)
  const { data: recentTransactions = [] } = useRecentTransactions(5)
  const { data: activeGoals = [] } = useActiveGoals()

  // Widget visibility checks
  const showNetWorth = useIsWidgetVisible('net-worth')
  const showAlerts = useIsWidgetVisible('alerts')
  const showFinancialHealth = useIsWidgetVisible('financial-health')
  const showSpendingTrends = useIsWidgetVisible('spending-trends')
  const showCategoryBreakdown = useIsWidgetVisible('category-breakdown')
  const showMonthComparison = useIsWidgetVisible('month-comparison')
  const showQuickStats = useIsWidgetVisible('quick-stats')
  const showGoals = useIsWidgetVisible('goals')
  const showAccountBalances = useIsWidgetVisible('account-balances')
  const showInsights = useIsWidgetVisible('insights')
  const showRecentTransactions = useIsWidgetVisible('recent-transactions')

  // Check if any widgets are visible
  const hasAnyWidgets = showNetWorth || showAlerts || showFinancialHealth ||
    showSpendingTrends || showCategoryBreakdown || showMonthComparison ||
    showQuickStats || showGoals || showAccountBalances || showInsights || showRecentTransactions

  // Get display month for subtitles
  const displayMonth = selectedMonth 
    ? format(parseISO(`${selectedMonth}-01`), 'MMMM yyyy')
    : format(new Date(), 'MMMM yyyy')

  return (
    <>
      <div className="min-h-screen pb-6">
        {/* Page Header - Always visible */}
        <div className="px-4 pt-6 pb-4">
          <PageHeader
            title={`Good ${getGreeting()}`}
            subtitle="Track your finances in one place"
            actions={
              <button
                onClick={() => setIsSettingsOpen(true)}
                className="p-2 rounded-ios bg-ios-gray-6 hover:bg-ios-gray-5 active:bg-ios-gray-4 transition-colors"
                aria-label="Widget Settings"
              >
                <Settings className="text-ios-label-secondary" size={24} />
              </button>
            }
          />
        </div>

        {/* Month Selector */}
        <MonthSelector 
          selectedMonth={selectedMonth}
          onChange={setSelectedMonth}
        />

        {/* Hero Section - Net Worth */}
        {showNetWorth && (
          <div className="px-4 pb-6">
            <div className="bg-white rounded-ios-lg p-6 shadow-ios-lg border border-ios-gray-5">
              <p className="text-ios-callout text-ios-gray-1 mb-1">Total Net Worth</p>
              <p className="text-3xl sm:text-4xl md:text-5xl font-bold text-ios-label-primary mb-4">
                {summary ? <Money amount={summary.netWorth} currency='EGP' /> : '—'}
              </p>

              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-ios-gray-5">
                <div>
                  <p className="text-ios-caption text-ios-gray-2 mb-1">{displayMonth} Income</p>
                  <p className="text-ios-callout sm:text-ios-body font-semibold text-ios-label-primary">
                    {summary ? <Money amount={summary.thisMonthIncome} currency='EGP' /> : '—'}
                  </p>
                </div>
                <div>
                  <p className="text-ios-caption text-ios-gray-2 mb-1">{displayMonth} Expenses</p>
                  <p className="text-ios-callout sm:text-ios-body font-semibold text-ios-label-primary">
                    {summary ? <Money amount={summary.thisMonthExpenses} currency='EGP' /> : '—'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Dashboard Widgets */}
        <div className="px-4 space-y-6">
          {/* Empty state when no widgets are visible */}
          {!hasAnyWidgets && (
            <div className="bg-white rounded-ios-lg p-8 shadow-ios border border-ios-gray-5 text-center">
              <Settings className="text-ios-gray-3 mx-auto mb-4" size={64} />
              <h3 className="text-ios-title-2 font-semibold text-ios-label-primary mb-2">
                No Widgets Enabled
              </h3>
              <p className="text-ios-body text-ios-gray-1 mb-4">
                You&apos;ve hidden all dashboard widgets. Enable some widgets to see your financial data.
              </p>
              <button
                onClick={() => setIsSettingsOpen(true)}
                className="inline-flex items-center gap-2 py-3 px-6 bg-ios-blue hover:bg-blue-600 text-white rounded-ios font-medium transition-colors"
              >
                <Settings size={24} />
                Open Widget Settings
              </button>
            </div>
          )}

          {/* Alerts Widget */}
          {showAlerts && <AlertsWidget />}

          {/* Financial Health Widget */}
          {showFinancialHealth && <FinancialHealthWidget />}

          {/* Charts Section */}
          {showSpendingTrends && <SpendingTrendsChart selectedMonth={selectedMonth} />}
          {showCategoryBreakdown && <CategoryBreakdownChart selectedMonth={selectedMonth} />}

          {/* Month Comparison */}
          {showMonthComparison && <MonthComparisonWidget selectedMonth={selectedMonth} />}

          {/* Quick Stats */}
          {showQuickStats && <QuickStatsWidget selectedMonth={selectedMonth} />}

          {/* Active Goals */}
          {showGoals && activeGoals.length > 0 && (
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

              <div className="bg-white rounded-ios-lg shadow-ios border border-ios-gray-5 overflow-hidden">
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
                        index < activeGoals.slice(0, 3).length - 1 && 'border-b border-ios-gray-5'
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
                        {<Money amount={Number(goal.balance)} currency={goal.currency} />} of{' '}
                        {<Money amount={Number(goal.target)} currency={goal.currency} />}
                      </p>
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* Account Balances */}
          {showAccountBalances && <AccountBalancesWidget />}

          {/* Insights */}
          {showInsights && <InsightsWidget />}

          {/* Recent Transactions */}
          {showRecentTransactions && recentTransactions.length > 0 && (
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

      {/* Widget Settings Modal */}
      <Modal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        title="Widget Settings"
      >
        <WidgetSettings onClose={() => setIsSettingsOpen(false)} />
      </Modal>
    </>
  )
}
