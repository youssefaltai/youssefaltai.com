'use client'

import { ChevronRight } from 'lucide-react'
import { Paper, Stack, Group, Text, Progress, Title, UnstyledButton } from '@mantine/core'
import { calculateGoalProgress } from '../../utils/calculations'
import { useRouter } from 'next/navigation'
import { Money } from '../shared/Money'
import type { Account } from '@repo/db'

interface GoalsProgressProps {
  goals: Account[]
}

/**
 * Dashboard section showing progress for active goals
 * Displays top 3 goals with progress bars
 */
export function GoalsProgress({ goals }: GoalsProgressProps) {
  const router = useRouter()

  // Take top 3 goals
  const topGoals = goals.slice(0, 3)

  if (topGoals.length === 0) {
    return null
  }

  return (
    <Stack gap="sm">
      {/* Header */}
      <Group justify="space-between">
        <Title order={3} size="h4">
          Your Goals
        </Title>
        <UnstyledButton onClick={() => router.push('/goals')}>
          <Group gap="xs" c="blue">
            <Text size="sm">View All</Text>
            <ChevronRight size={16} />
          </Group>
        </UnstyledButton>
      </Group>

      {/* Goals List */}
      <Paper withBorder>
        <Stack gap={0}>
          {topGoals.map((goal, index) => {
            const progress = goal.target
              ? calculateGoalProgress(Number(goal.balance), Number(goal.target))
              : 0

            return (
              <div
                key={goal.id}
                style={{
                  padding: '1rem',
                  borderBottom: index < topGoals.length - 1 ? '1px solid var(--mantine-color-gray-3)' : 'none'
                }}
              >
                <Group justify="space-between" mb="xs">
                  <Text fw={600}>{goal.name}</Text>
                  <Text fw={600} c="blue">{Math.round(progress)}%</Text>
                </Group>

                <Progress value={progress} size="sm" mb="xs" />

                <Text size="xs" c="dimmed">
                  <Money amount={Number(goal.balance)} currency={goal.currency} /> of{' '}
                  <Money amount={Number(goal.target)} currency={goal.currency} />
                </Text>
              </div>
            )
          })}
        </Stack>
      </Paper>
    </Stack>
  )
}

