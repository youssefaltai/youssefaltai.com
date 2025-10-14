'use client'

import {
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Target,
  PiggyBank,
  Activity,
  Heart,
  Receipt,
} from 'lucide-react'
import { Stack, Group, Text, Paper, Title, Skeleton } from '@mantine/core'
import { useInsights } from '../../hooks/use-dashboard-insights'
import type { Insight } from '../../app/api/dashboard/insights/route'

/**
 * Insights widget
 * Shows AI-generated financial insights and tips
 */
export function InsightsWidget() {
  const { data: insights, isLoading, error } = useInsights()

  const getInsightIcon = (iconName: string) => {
    const size = 20
    switch (iconName) {
      case 'TrendingUp':
        return <TrendingUp size={size} />
      case 'TrendingDown':
        return <TrendingDown size={size} />
      case 'AlertTriangle':
        return <AlertTriangle size={size} />
      case 'Target':
        return <Target size={size} />
      case 'PiggyBank':
        return <PiggyBank size={size} />
      case 'Activity':
        return <Activity size={size} />
      case 'Heart':
        return <Heart size={size} />
      case 'Receipt':
        return <Receipt size={size} />
      default:
        return <Activity size={size} />
    }
  }

  const getInsightColor = (type: Insight['type']) => {
    switch (type) {
      case 'positive':
        return 'green'
      case 'warning':
        return 'orange'
      case 'info':
      default:
        return 'blue'
    }
  }

  return (
    <Paper withBorder shadow="sm">
      <Group justify="space-between" p="md" style={{ borderBottom: '1px solid var(--mantine-color-gray-3)' }}>
        <div>
          <Title order={3} size="h4">Insights</Title>
          <Text size="xs" c="dimmed" mt={2}>Personalized financial tips</Text>
        </div>
      </Group>

      <div style={{ padding: '1rem' }}>
        {error ? (
          <Text c="red" ta="center" py="xl">
            {error instanceof Error ? error.message : 'Failed to load insights'}
          </Text>
        ) : isLoading ? (
          <Stack gap="sm">
            <Skeleton height={16} />
            <Skeleton height={16} width="75%" />
            <Skeleton height={16} width="50%" />
          </Stack>
        ) : !insights || insights.length === 0 ? (
          <Stack align="center" gap="sm" py="xl">
            <div style={{ opacity: 0.5 }}>
              <Activity size={48} />
            </div>
            <Text c="dimmed">No insights available yet</Text>
          </Stack>
        ) : (
          <Stack gap="sm">
            {insights.map((insight) => {
              const color = getInsightColor(insight.type)
              return (
                <Group
                  key={insight.id}
                  p="md"
                  gap="sm"
                  align="flex-start"
                  style={{ 
                    borderRadius: 'var(--mantine-radius-md)',
                    backgroundColor: `var(--mantine-color-${color}-0)`,
                  }}
                >
                  <div style={{ color: `var(--mantine-color-${color}-6)` }}>
                    {getInsightIcon(insight.icon)}
                  </div>
                  <Text size="sm" style={{ flex: 1 }}>{insight.message}</Text>
                </Group>
              )
            })}
          </Stack>
        )}
      </div>
    </Paper>
  )
}
