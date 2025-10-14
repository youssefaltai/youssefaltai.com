'use client'

import { Heart } from 'lucide-react'
import { RingProgress, Stack, Group, Text, Title, Paper, List, Skeleton } from '@mantine/core'
import { useFinancialHealthScore } from '../../hooks/use-dashboard-insights'

/**
 * Financial health widget
 * Shows a health score with visual indicator
 * All color/label/tips logic is determined by the backend
 */
export function FinancialHealthWidget() {
  const { data: healthData, isLoading, error } = useFinancialHealthScore()

  // Map color class to Mantine color
  const getColor = (colorClass: string) => {
    if (colorClass.includes('green')) return 'green'
    if (colorClass.includes('yellow')) return 'yellow'
    if (colorClass.includes('orange')) return 'orange'
    if (colorClass.includes('red')) return 'red'
    return 'blue'
  }

  const color = healthData ? getColor(healthData.color) : 'blue'

  return (
    <Paper withBorder shadow="sm">
      <Group justify="space-between" p="md" style={{ borderBottom: '1px solid var(--mantine-color-gray-3)' }}>
        <div>
          <Title order={3} size="h4">Financial Health</Title>
          <Text size="xs" c="dimmed" mt={2}>Your overall financial health score</Text>
        </div>
      </Group>

      <div style={{ padding: '1rem' }}>
        {error ? (
          <Text c="red" ta="center" py="xl">
            {error instanceof Error ? error.message : 'Failed to load health score'}
          </Text>
        ) : isLoading ? (
          <Stack gap="sm">
            <Skeleton height={16} />
            <Skeleton height={16} width="75%" />
            <Skeleton height={16} width="50%" />
          </Stack>
        ) : (
          <Stack align="center" gap="lg">
            {/* Ring Progress */}
            <RingProgress
              size={160}
              thickness={12}
              sections={[{ value: healthData?.score || 0, color: color }]}
              label={
                <Stack align="center" gap={0}>
                  <Title order={1} size={48}>{healthData?.score || 0}</Title>
                  <Text size="sm" c="dimmed">out of 100</Text>
                </Stack>
              }
            />

            {/* Status label */}
            <Group gap="xs">
              <Heart size={20} fill="currentColor" color={`var(--mantine-color-${color}-6)`} />
              <Title order={3} size="h4" c={color}>
                {healthData?.label}
              </Title>
            </Group>

            {/* Tips */}
            <Paper p="md" style={{ width: '100%', backgroundColor: 'var(--mantine-color-gray-0)' }}>
              <Text size="xs" fw={600} c="dimmed" mb="xs">Tips to improve:</Text>
              <List size="sm" spacing="xs">
                {healthData?.tips.map((tip, index) => (
                  <List.Item key={index}>{tip}</List.Item>
                ))}
              </List>
            </Paper>
          </Stack>
        )}
      </div>
    </Paper>
  )
}
