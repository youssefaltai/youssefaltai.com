'use client'

import { CreditCard } from 'lucide-react'
import { UnstyledButton, Group, Text } from '@mantine/core'
import { Money } from '../shared/Money'
import type { Account } from '@repo/db'

interface CreditCardCardProps {
  creditCard: Account
  onClick?: () => void
  isFirst?: boolean
  isLast?: boolean
}

/**
 * Display item for a credit card in a grouped list
 */
export function CreditCardCard({ creditCard, onClick, isFirst: _isFirst, isLast }: CreditCardCardProps) {
  const balance = Number(creditCard.balance)

  return (
    <UnstyledButton onClick={onClick} style={{ width: '100%' }}>
      <Group
        p="md"
        justify="space-between"
        style={{
          borderBottom: !isLast ? '1px solid var(--mantine-color-gray-3)' : 'none',
        }}
      >
        <Group gap="sm" style={{ flex: 1 }}>
          <CreditCard size={20} style={{ opacity: 0.6 }} />
          <div>
            <Text fw={500}>{creditCard.name}</Text>
            {creditCard.description && (
              <Text size="xs" c="dimmed">{creditCard.description}</Text>
            )}
          </div>
        </Group>
        <Text fw={600}>
          <Money amount={balance} currency={creditCard.currency} />
        </Text>
      </Group>
    </UnstyledButton>
  )
}
