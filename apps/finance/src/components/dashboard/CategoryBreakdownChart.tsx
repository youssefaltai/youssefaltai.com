'use client'

import { useMemo } from 'react'
import { DonutChart } from '@mantine/charts'
import { Receipt } from 'lucide-react'
import { Text, Paper, Title, Group, Skeleton, Stack } from '@mantine/core'
import { useCategoryBreakdown } from '../../hooks/use-dashboard-analytics'
import { format, parseISO } from '@repo/utils'

interface CategoryBreakdownChartProps {
  selectedMonth?: string
}

/**
 * Category breakdown chart widget
 * Shows top 5 expense categories as a pie chart
 */
export function CategoryBreakdownChart({ selectedMonth }: CategoryBreakdownChartProps) {
    const { data: categories, isLoading, error } = useCategoryBreakdown(selectedMonth)

    // Get subtitle text based on selected month
    const subtitle = useMemo(() => {
        if (!selectedMonth) {
            return 'Where your money is going'
        }
        const monthDate = parseISO(`${selectedMonth}-01`)
        const monthName = format(monthDate, 'MMMM yyyy')
        return `${monthName} expenses`
    }, [selectedMonth])

    // Format data for chart
    const colors = ['blue.6', 'green.6', 'orange.6', 'red.6', 'violet.6'] as const
    const chartData = categories?.map((cat, index) => ({
        name: cat.category,
        value: cat.amount,
        color: colors[index % colors.length]!,
    })) || []

    const totalPercentage = categories?.reduce((sum, cat) => sum + cat.percentage, 0) || 0

    return (
      <Paper withBorder shadow="sm">
        <Group justify="space-between" p="md" style={{ borderBottom: '1px solid var(--mantine-color-gray-3)' }}>
          <div>
            <Title order={3} size="h4">Top Expense Categories</Title>
            <Text size="xs" c="dimmed" mt={2}>{subtitle}</Text>
          </div>
        </Group>

        <div style={{ padding: '1rem' }}>
          {error ? (
            <Text c="red" ta="center" py="xl">
              {error instanceof Error ? error.message : 'Failed to load breakdown'}
            </Text>
          ) : isLoading ? (
            <Stack gap="sm">
              <Skeleton height={16} />
              <Skeleton height={16} width="75%" />
              <Skeleton height={16} width="50%" />
            </Stack>
          ) : chartData.length === 0 ? (
            <Stack align="center" gap="sm" py="xl">
              <div style={{ opacity: 0.5 }}>
                <Receipt size={48} />
              </div>
              <Text c="dimmed">No expense transactions this month</Text>
            </Stack>
          ) : (
            <>
              <DonutChart
                  data={chartData}
                  chartLabel="Categories"
                  h={300}
                  withLabelsLine
                  withLabels
              />

              {/* Summary */}
              <Text size="xs" c="dimmed" ta="center" mt="md" pt="md" style={{ borderTop: '1px solid var(--mantine-color-gray-3)' }}>
                  Top {chartData.length} categories account for {totalPercentage.toFixed(1)}% of expenses
              </Text>
            </>
          )}
        </div>
      </Paper>
    )
}
