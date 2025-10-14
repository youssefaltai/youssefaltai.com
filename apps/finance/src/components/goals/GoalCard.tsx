'use client'

import { UnstyledButton, Group, Text, Progress, Badge, Stack } from '@mantine/core'
import { Money } from '../shared/Money'
import { calculateGoalProgress, formatDueDateStatus } from '../../utils/calculations'
import { ensureDate } from '@repo/utils'
import { formatDistanceToNow, format, differenceInDays } from '@repo/utils'
import type { Account } from '@repo/db'

interface GoalCardProps {
  goal: Account
  onClick?: () => void
  isFirst?: boolean
  isLast?: boolean
}

/**
 * Display item for a goal in a grouped list
 * Shows name, progress, target amount, and due date
 */
export function GoalCard({ goal, onClick, isFirst: _isFirst, isLast }: GoalCardProps) {
  const progress = goal.target
    ? calculateGoalProgress(Number(goal.balance), Number(goal.target))
    : 0

  const isCompleted = progress >= 100

  return (
    <UnstyledButton onClick={onClick} style={{ width: '100%' }}>
      <Stack
        p="md"
        gap="sm"
        style={{
          borderBottom: !isLast ? '1px solid var(--mantine-color-gray-3)' : 'none',
        }}
      >
        {/* Header */}
        <Group justify="space-between">
          <div style={{ flex: 1 }}>
            <Text fw={600}>{goal.name}</Text>
            {goal.description && (
              <Text size="xs" c="dimmed">{goal.description}</Text>
            )}
          </div>
          {isCompleted && (
            <Badge variant="light" color="blue" size="sm">
              COMPLETED
            </Badge>
          )}
        </Group>

        {/* Progress */}
        <Stack gap="xs">
          <Progress value={progress} size="sm" />
          <Group justify="space-between">
            <Text size="xs" c="dimmed">
              <Money amount={Number(goal.balance)} currency={goal.currency} /> of{' '}
              <Money amount={Number(goal.target)} currency={goal.currency} />
            </Text>
            <Text size="xs" fw={600}>
              {Math.round(progress)}%
            </Text>
          </Group>
        </Stack>

        {/* Due date */}
        {goal.dueDate && (
          <Group justify="space-between" style={{ paddingTop: '0.5rem', borderTop: '1px solid var(--mantine-color-gray-3)' }}>
            <Text size="xs" c="dimmed">
              {formatDueDateStatus(goal.dueDate)}
            </Text>
            <Text size="xs" c="dimmed">
              {(() => {
                const date = ensureDate(goal.dueDate)
                const daysDiff = differenceInDays(date, new Date())
                // Use relative format for dates within 30 days
                if (daysDiff >= 0 && daysDiff <= 30) {
                  return formatDistanceToNow(date, { addSuffix: true })
                }
                // Use just date for further out
                return format(date, 'PP')
              })()}
            </Text>
          </Group>
        )}
      </Stack>
    </UnstyledButton>
  )
}
