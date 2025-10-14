'use client'

import { UnstyledButton, Group, Text, Progress, Skeleton, Badge, Stack } from '@mantine/core'
import { format } from '@repo/utils'
import { useBudgetProgress } from '../../hooks/use-budget-progress'
import { Money } from '../shared/Money'
import type { Currency } from '@repo/db'

interface Budget {
  id: string
  name: string
  amount: string
  currency: string
  startDate: string
  endDate: string
  accounts: Array<{
    account: {
      id: string
      name: string
    }
  }>
}

interface BudgetCardProps {
  budget: Budget
  onClick?: () => void
  isFirst?: boolean
  isLast?: boolean
}

/**
 * Display item for a budget in a grouped list
 * Shows name, amount, date range, progress bar, and expense categories
 */
export function BudgetCard({ budget, onClick, isFirst: _isFirst, isLast }: BudgetCardProps) {
  const { data: progress, isLoading } = useBudgetProgress(budget.id)

  const percentage = progress?.percentage || 0
  const isOverBudget = progress?.isOverBudget || false

  // Color coding based on percentage
  const getProgressColor = () => {
    if (isOverBudget) return 'red'
    if (percentage >= 80) return 'orange'
    return 'green'
  }

  const formatDateRange = () => {
    const start = new Date(budget.startDate)
    const end = new Date(budget.endDate)
    return `${format(start, 'MMM d')} - ${format(end, 'MMM d, yyyy')}`
  }

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
          <div>
            <Text fw={600}>{budget.name}</Text>
            <Text size="xs" c="dimmed">{formatDateRange()}</Text>
          </div>
          <Text fw={600}>
            <Money
              amount={Number(budget.amount)}
              currency={budget.currency as Currency}
            />
          </Text>
        </Group>

        {/* Progress */}
        {isLoading ? (
          <Skeleton height={8} radius="xl" />
        ) : progress ? (
          <Stack gap="xs">
            <Progress value={Math.min(percentage, 100)} color={getProgressColor()} size="sm" />
            <Group justify="space-between">
              <Text size="xs" c="dimmed">
                <Money amount={progress.spent} currency={progress.budgetCurrency as Currency} /> spent
              </Text>
              <Text size="xs" fw={600} c={isOverBudget ? 'red' : 'default'}>
                {isOverBudget ? (
                  <>
                    +<Money amount={Math.abs(progress.remaining)} currency={progress.budgetCurrency as Currency} /> over
                  </>
                ) : (
                  <>
                    <Money amount={progress.remaining} currency={progress.budgetCurrency as Currency} /> left
                  </>
                )}
              </Text>
            </Group>
          </Stack>
        ) : null}

        {/* Expense Categories */}
        {budget.accounts.length > 0 && (
          <div style={{ paddingTop: '0.5rem', borderTop: '1px solid var(--mantine-color-gray-3)' }}>
            <Text size="xs" c="dimmed" mb={4}>Categories:</Text>
            <Group gap="xs">
              {budget.accounts.map((ba) => (
                <Badge
                  key={ba.account.id}
                  variant="light"
                  size="sm"
                >
                  {ba.account.name}
                </Badge>
              ))}
            </Group>
          </div>
        )}
      </Stack>
    </UnstyledButton>
  )
}

