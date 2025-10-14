'use client'

import { BarChart } from '@mantine/charts'
import { TrendingUp, TrendingDown } from 'lucide-react'
import { SimpleGrid, Stack, Paper, Title, Text, Group, Skeleton } from '@mantine/core'
import { WidgetStat } from './WidgetStat'
import { useMonthComparison } from '../../hooks/use-dashboard-analytics'
import { formatNumberCompact } from '@repo/utils'

interface MonthComparisonWidgetProps {
  selectedMonth?: string
}

/**
 * Month comparison widget
 * Shows the last 6 months of income, expenses, and savings
 */
export function MonthComparisonWidget({ selectedMonth }: MonthComparisonWidgetProps) {
  const { data: comparison, isLoading, error } = useMonthComparison(selectedMonth)

  // Format data for chart - use the 6 months data
  const chartData = comparison?.months.map((month) => ({
    month: month.month,
    Income: month.income,
    Expenses: month.expenses,
    Savings: month.savings,
  })) || []

  const formatChange = (change: number) => {
    const sign = change >= 0 ? '+' : ''
    return `${sign}${change.toFixed(1)}%`
  }

  return (
    <Paper withBorder shadow="sm">
      <Group justify="space-between" p="md" style={{ borderBottom: '1px solid var(--mantine-color-gray-3)' }}>
        <div>
          <Title order={3} size="h4">Month Comparison</Title>
          <Text size="xs" c="dimmed" mt={2}>Income, expenses, and savings over time</Text>
        </div>
      </Group>

      <div style={{ padding: '1rem' }}>
        {error ? (
          <Text c="red" ta="center" py="xl">
            {error instanceof Error ? error.message : 'Failed to load comparison'}
          </Text>
        ) : isLoading ? (
          <Stack gap="sm">
            <Skeleton height={16} />
            <Skeleton height={16} width="75%" />
            <Skeleton height={16} width="50%" />
          </Stack>
        ) : !comparison ? (
          <Stack align="center" gap="sm" py="xl">
            <Text c="dimmed">Not enough data to display</Text>
          </Stack>
        ) : (
          <Stack gap="md">
            {/* Chart */}
            <BarChart
              h={250}
              data={chartData}
              dataKey="month"
              series={[
                { name: 'Income', color: 'green.6' },
                { name: 'Expenses', color: 'red.6' },
                { name: 'Savings', color: 'blue.6' },
              ]}
              withLegend
              valueFormatter={(value) => formatNumberCompact(value)}
            />

            {/* Change indicators */}
            <SimpleGrid cols={1} spacing="md" style={{ paddingTop: '1rem', borderTop: '1px solid var(--mantine-color-gray-3)' }}>
              <WidgetStat
                label="Income"
                value={comparison.thisMonth.income}
                currency='EGP'
                change={formatChange(comparison.change.income)}
                changeType={comparison.change.income >= 0 ? 'positive' : 'negative'}
                icon={comparison.change.income >= 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
              />
              <WidgetStat
                label="Expenses"
                value={comparison.thisMonth.expenses}
                currency='EGP'
                change={formatChange(comparison.change.expenses)}
                changeType={comparison.change.expenses >= 0 ? 'negative' : 'positive'}
                icon={comparison.change.expenses >= 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
              />
              <WidgetStat
                label="Savings"
                value={comparison.thisMonth.savings}
                currency='EGP'
                change={formatChange(comparison.change.savings)}
                changeType={comparison.change.savings >= 0 ? 'positive' : 'negative'}
                icon={comparison.change.savings >= 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
              />
            </SimpleGrid>
          </Stack>
        )}
      </div>
    </Paper>
  )
}
