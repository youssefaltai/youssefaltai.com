'use client'

import { Landmark } from 'lucide-react'
import { UnstyledButton, Group, Text, Stack } from '@mantine/core'
import { Money } from '../shared/Money'
import { formatDueDateStatus, isOverdue } from '../../utils/calculations'
import type { Account } from '@repo/db'

interface LoanCardProps {
  loan: Account
  onClick?: () => void
  isFirst?: boolean
  isLast?: boolean
}

/**
 * Display item for a loan in a grouped list
 */
export function LoanCard({ loan, onClick, isFirst: _isFirst, isLast }: LoanCardProps) {
  const amountOwed = Number(loan.balance)
  const overdue = loan.dueDate ? isOverdue(loan.dueDate) : false

  return (
    <UnstyledButton onClick={onClick} style={{ width: '100%' }}>
      <Group
        p="md"
        align="flex-start"
        justify="space-between"
        style={{
          borderBottom: !isLast ? '1px solid var(--mantine-color-gray-3)' : 'none',
        }}
      >
        <Group gap="sm" style={{ flex: 1 }} align="flex-start">
          <Landmark size={20} style={{ opacity: 0.6, marginTop: 2 }} />
          <Stack gap={4}>
            <Text fw={500}>{loan.name}</Text>
            {loan.description && (
              <Text size="xs" c="dimmed">{loan.description}</Text>
            )}
            {loan.dueDate && (
              <Text
                size="xs"
                fw={overdue ? 600 : 400}
                c={overdue ? 'default' : 'dimmed'}
              >
                {formatDueDateStatus(loan.dueDate)}
              </Text>
            )}
          </Stack>
        </Group>
        <Text fw={600}>
          <Money amount={amountOwed} currency={loan.currency} />
        </Text>
      </Group>
    </UnstyledButton>
  )
}
