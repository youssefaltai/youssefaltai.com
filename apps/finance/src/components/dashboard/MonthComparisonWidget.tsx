'use client'

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { DashboardWidget, WidgetStat } from './DashboardWidget'
import { useMonthComparison } from '../../hooks/use-dashboard-analytics'
import { formatNumberCompact } from '@repo/utils'
import { TrendingUp, TrendingDown, Money } from '@repo/ui'

/**
 * Month comparison widget
 * Shows the last 6 months of income, expenses, and savings
 */
export function MonthComparisonWidget() {
  const { data: comparison, isLoading, error } = useMonthComparison()

  // Format data for chart - use the 6 months data
  const chartData = comparison?.months.map((month) => ({
    name: month.month,
    Income: month.income,
    Expenses: month.expenses,
    Savings: month.savings,
  })) || []

  // Custom tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (!active || !payload || !payload.length) return null

    return (
      <div className="bg-white border border-ios-gray-5 rounded-ios shadow-ios-lg p-3">
        <p className="text-ios-body font-semibold text-ios-label-primary mb-2">
          {payload[0].payload.name}
        </p>
        {payload.map((entry: any, index: number) => (
          <p
            key={`tooltip-${index}`}
            className="text-ios-callout text-ios-gray-1"
            style={{ color: entry.color }}
          >
            {entry.name}: {<Money amount={entry.value} currency='EGP' />}
          </p>
        ))}
      </div>
    )
  }

  const formatChange = (change: number) => {
    const sign = change >= 0 ? '+' : ''
    return `${sign}${change.toFixed(1)}%`
  }

  return (
    <DashboardWidget
      title="Month Comparison"
      subtitle="Income, expenses, and savings over time"
      loading={isLoading}
      error={error instanceof Error ? error.message : null}
      isEmpty={!comparison}
      emptyMessage="Not enough data to display"
    >
      {comparison && (
        <div className="space-y-4">
          {/* Chart - Always visible */}
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E5EA" />
              <XAxis
                dataKey="name"
                stroke="#8E8E93"
                style={{ fontSize: '11px' }}
                tickLine={false}
                axisLine={{ stroke: '#E5E5EA' }}
              />
              <YAxis
                stroke="#8E8E93"
                style={{ fontSize: '12px' }}
                tickLine={false}
                axisLine={{ stroke: '#E5E5EA' }}
                tickFormatter={formatNumberCompact}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                wrapperStyle={{ fontSize: '12px' }}
                iconType="circle"
              />
              <Bar dataKey="Income" fill="#34C759" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Expenses" fill="#FF3B30" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Savings" fill="#007AFF" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>

          {/* Change indicators */}
          <div className="grid grid-cols-1 gap-4 pt-4 border-t border-ios-gray-5">
            <WidgetStat
              label="Income"
              value={comparison.thisMonth.income}
              currency='EGP'
              change={formatChange(comparison.change.income)}
              changeType={comparison.change.income >= 0 ? 'positive' : 'negative'}
              icon={comparison.change.income >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
            />
            <WidgetStat
              label="Expenses"
              value={comparison.thisMonth.expenses}
              currency='EGP'
              change={formatChange(comparison.change.expenses)}
              changeType={comparison.change.expenses >= 0 ? 'negative' : 'positive'}
              icon={comparison.change.expenses >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
            />
            <WidgetStat
              label="Savings"
              value={comparison.thisMonth.savings}
              currency='EGP'
              change={formatChange(comparison.change.savings)}
              changeType={comparison.change.savings >= 0 ? 'positive' : 'negative'}
              icon={comparison.change.savings >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
            />
          </div>
        </div>
      )}
    </DashboardWidget>
  )
}

