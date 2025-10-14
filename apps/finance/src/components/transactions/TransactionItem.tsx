'use client'

import { ArrowRight } from 'lucide-react'
import { UnstyledButton, Group, Text, Stack } from '@mantine/core'
import { Money } from '../shared/Money'
import { ensureDate } from '@repo/utils'
import type { TTransaction } from '@repo/db'
import { formatDistanceToNow, format, differenceInDays } from '@repo/utils'

interface TransactionItemProps {
  transaction: TTransaction
  onClick?: () => void
  isFirst?: boolean
  isLast?: boolean
}

/**
 * Display component for a single transaction in a grouped list
 * Shows from/to accounts, amount, date, and description
 */
export function TransactionItem({ transaction, onClick, isFirst: _isFirst, isLast }: TransactionItemProps) {
  const amount = Number(transaction.amount)

  return (
    <UnstyledButton onClick={onClick} style={{ width: '100%' }}>
      <Stack
        p="md"
        gap="xs"
        style={{
          borderBottom: !isLast ? '1px solid var(--mantine-color-gray-3)' : 'none',
        }}
      >
        {/* From/To */}
        <Group gap="xs" wrap="nowrap">
          <Text fw={500} truncate style={{ flex: 1 }}>
            {transaction.fromAccount.name}
          </Text>
          <ArrowRight size={16} style={{ opacity: 0.5, flexShrink: 0 }} />
          <Text fw={500} truncate style={{ flex: 1 }}>
            {transaction.toAccount.name}
          </Text>
        </Group>

        {/* Description */}
        {transaction.description && (
          <Text size="xs" c="dimmed">
            {transaction.description}
          </Text>
        )}

        {/* Amount and Date */}
        <Group justify="space-between">
          <Text size="sm" c="dimmed">
            {(() => {
              const date = ensureDate(transaction.date)
              const daysDiff = Math.abs(differenceInDays(new Date(), date))
              // Use relative format for dates within 7 days
              if (daysDiff <= 7) {
                return formatDistanceToNow(date, { addSuffix: true })
              }
              // Use full datetime for older dates
              return format(date, 'PP p')
            })()}
          </Text>
          <Text fw={600} c="blue">
            <Money amount={amount} currency={transaction.currency} />
          </Text>
        </Group>
      </Stack>
    </UnstyledButton>
  )
}
