'use client'

import { useState, useMemo } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { DashboardWidget } from './DashboardWidget'
import { useSpendingTrends } from '../../hooks/use-dashboard-analytics'
import { getDate, formatNumberCompact, format, parseISO } from '@repo/utils'
import { Money, SegmentedControl } from '@repo/ui'
import type { SegmentedControlOption } from '@repo/ui'

type ViewMode = 'both' | 'income' | 'expenses'

const VIEW_MODE_OPTIONS: SegmentedControlOption<ViewMode>[] = [
    { value: 'both', label: 'Both' },
    { value: 'income', label: 'Income' },
    { value: 'expenses', label: 'Expenses' },
]

interface SpendingTrendsChartProps {
  selectedMonth?: string
}

/**
 * Spending trends chart widget
 * Shows daily income and expenses for the selected month
 */
export function SpendingTrendsChart({ selectedMonth }: SpendingTrendsChartProps) {
    const { data: trends, isLoading, error } = useSpendingTrends(selectedMonth)
    const [viewMode, setViewMode] = useState<ViewMode>('both')

    // Get subtitle text based on selected month
    const subtitle = useMemo(() => {
        if (!selectedMonth) {
            return 'Daily breakdown for this month'
        }
        const monthDate = parseISO(`${selectedMonth}-01`)
        const monthName = format(monthDate, 'MMMM yyyy')
        return `Daily breakdown for ${monthName}`
    }, [selectedMonth])

    // Format data for chart
    const chartData = trends.map((day) => ({
        date: getDate(new Date(day.date)).toString(),
        income: day.income,
        expenses: day.expenses,
    }))

    // Custom tooltip
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const CustomTooltip = ({ active, payload }: any) => {
        if (!active || !payload || !payload.length) return null

        const data = payload[0].payload

        return (
            <div className="bg-white border border-ios-gray-5 rounded-ios shadow-ios-lg p-3">
                <p className="text-ios-caption text-ios-gray-2 mb-1">Day {data.date}</p>
                {(viewMode === 'both' || viewMode === 'income') && (
                    <p className="text-ios-body text-ios-green font-medium">
                        Income: {<Money amount={data.income} currency='EGP' />}
                    </p>
                )}
                {(viewMode === 'both' || viewMode === 'expenses') && (
                    <p className="text-ios-body text-ios-red font-medium">
                        Expenses: {<Money amount={data.expenses} currency='EGP' />}
                    </p>
                )}
            </div>
        )
    }

    return (
        <DashboardWidget
            title="Spending Trends"
            subtitle={subtitle}
            loading={isLoading}
            error={error instanceof Error ? error.message : null}
            isEmpty={chartData.length === 0}
            emptyMessage="No transactions this month"
        >
            {/* View mode picker */}
            <div className="mb-4">
                <SegmentedControl
                    options={VIEW_MODE_OPTIONS}
                    value={viewMode}
                    onChange={setViewMode}
                />
            </div>
            
            {/* Chart - Always visible */}
            <ResponsiveContainer width="100%" height={250}>
                <LineChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E5EA" />
                    <XAxis
                        dataKey="date"
                        stroke="#8E8E93"
                        style={{ fontSize: '12px' }}
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
                    {(viewMode === 'both' || viewMode === 'income') && (
                        <Line
                            type="monotone"
                            dataKey="income"
                            stroke="#34C759"
                            strokeWidth={2}
                            dot={{ fill: '#34C759', r: 3 }}
                            activeDot={{ r: 5 }}
                        />
                    )}
                    {(viewMode === 'both' || viewMode === 'expenses') && (
                        <Line
                            type="monotone"
                            dataKey="expenses"
                            stroke="#FF3B30"
                            strokeWidth={2}
                            dot={{ fill: '#FF3B30', r: 3 }}
                            activeDot={{ r: 5 }}
                        />
                    )}
                </LineChart>
            </ResponsiveContainer>
        </DashboardWidget>
    )
}

