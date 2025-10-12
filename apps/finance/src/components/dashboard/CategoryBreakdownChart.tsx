'use client'

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'
import { DashboardWidget } from './DashboardWidget'
import { useCategoryBreakdown } from '../../hooks/use-dashboard-analytics'
import { Receipt, Money } from '@repo/ui'

const COLORS = ['#007AFF', '#34C759', '#FF9500', '#FF3B30', '#AF52DE']

/**
 * Category breakdown chart widget
 * Shows top 5 expense categories as a pie chart
 */
export function CategoryBreakdownChart() {
    const { data: categories, isLoading, error } = useCategoryBreakdown()

    // Format data for chart
    const chartData = categories.map((cat) => ({
        name: cat.category,
        value: cat.amount,
        percentage: cat.percentage,
        count: cat.count,
    }))

    // Custom tooltip
    const CustomTooltip = ({ active, payload }: any) => {
        if (!active || !payload || !payload.length) return null

        const data = payload[0].payload

        return (
            <div className="bg-white border border-ios-gray-5 rounded-ios shadow-ios-lg p-3">
                <p className="text-ios-body font-semibold text-ios-label-primary mb-1">{data.name}</p>
                <p className="text-ios-callout text-ios-gray-1">
                    {<Money amount={data.value} currency='EGP' />} ({data.percentage.toFixed(1)}%)
                </p>
                <p className="text-ios-caption text-ios-gray-2">{data.count} transactions</p>
            </div>
        )
    }

    // Custom legend
    const renderLegend = (props: any) => {
        const { payload } = props
        return (
            <div className="flex flex-col gap-2 mt-4">
                {payload.map((entry: any, index: number) => (
                    <div key={`legend-${index}`} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div
                                className="w-3 h-3 rounded-full"
                                style={{ backgroundColor: entry.color }}
                            />
                            <span className="text-ios-callout text-ios-label-primary">{entry.value}</span>
                        </div>
                        <span className="text-ios-callout font-semibold text-ios-label-primary">
                            {entry.payload.percentage.toFixed(1)}%
                        </span>
                    </div>
                ))}
            </div>
        )
    }

    return (
    <DashboardWidget
      title="Top Expense Categories"
      subtitle="Where your money is going"
      loading={isLoading}
            error={error instanceof Error ? error.message : null}
            isEmpty={chartData.length === 0}
            emptyMessage="No expense transactions this month"
            emptyIcon={<Receipt className="w-12 h-12" />}
        >
            <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                    <Pie
                        data={chartData}
                        cx="50%"
                        cy="40%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={(props: any) => `${props.percent ? (props.percent * 100).toFixed(0) : 0}%`}
                    >
                        {chartData.map((_, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                    <Legend content={renderLegend} />
                </PieChart>
            </ResponsiveContainer>

            {/* Summary */}
            {chartData.length > 0 && (
                <div className="mt-4 pt-4 border-t border-ios-gray-5">
                    <p className="text-ios-caption text-ios-gray-2 text-center">
                        Top {chartData.length} categories account for{' '}
                        {chartData.reduce((sum, cat) => sum + cat.percentage, 0).toFixed(1)}% of expenses
                    </p>
                </div>
            )}
        </DashboardWidget>
    )
}

