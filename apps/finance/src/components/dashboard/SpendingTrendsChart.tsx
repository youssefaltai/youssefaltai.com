'use client'

import { useState, useMemo } from 'react'
import { LineChart } from '@mantine/charts'
import { SegmentedControl, Paper, Title, Text, Group, Skeleton, Stack } from '@mantine/core'
import { useSpendingTrends } from '../../hooks/use-dashboard-analytics'
import { getDate, formatNumberCompact, format, parseISO } from '@repo/utils'

type ViewMode = 'both' | 'income' | 'expenses'

const VIEW_MODE_OPTIONS = [
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
    const chartData = trends?.map((day) => ({
        date: getDate(new Date(day.date)).toString(),
        Income: day.income,
        Expenses: day.expenses,
    })) || []

    // Determine which series to show
    const series = viewMode === 'both' 
        ? [{ name: 'Income', color: 'green.6' }, { name: 'Expenses', color: 'red.6' }]
        : viewMode === 'income'
        ? [{ name: 'Income', color: 'green.6' }]
        : [{ name: 'Expenses', color: 'red.6' }]

    return (
        <Paper withBorder shadow="sm">
          <Group justify="space-between" p="md" style={{ borderBottom: '1px solid var(--mantine-color-gray-3)' }}>
            <div>
              <Title order={3} size="h4">Spending Trends</Title>
              <Text size="xs" c="dimmed" mt={2}>{subtitle}</Text>
            </div>
          </Group>

          <div style={{ padding: '1rem' }}>
            {error ? (
              <Text c="red" ta="center" py="xl">
                {error instanceof Error ? error.message : 'Failed to load trends'}
              </Text>
            ) : isLoading ? (
              <Stack gap="sm">
                <Skeleton height={16} />
                <Skeleton height={16} width="75%" />
                <Skeleton height={16} width="50%" />
              </Stack>
            ) : chartData.length === 0 ? (
              <Stack align="center" gap="sm" py="xl">
                <Text c="dimmed">No transactions this month</Text>
              </Stack>
            ) : (
              <>
                {/* View mode picker */}
                <SegmentedControl
                    value={viewMode}
                    onChange={(value) => setViewMode(value as ViewMode)}
                    data={VIEW_MODE_OPTIONS}
                    mb="md"
                    fullWidth
                />
                
                {/* Chart */}
                <LineChart
                    h={250}
                    data={chartData}
                    dataKey="date"
                    series={series}
                    curveType="linear"
                    withLegend
                    valueFormatter={(value) => formatNumberCompact(value)}
                />
              </>
            )}
          </div>
        </Paper>
    )
}
