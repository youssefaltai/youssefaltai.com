'use client'

import { TrendingUp } from 'lucide-react'
import { UnstyledButton, Group, Text } from '@mantine/core'
import type { Account } from '@repo/db'

interface IncomeSourceCardProps {
  incomeSource: Account
  onClick?: () => void
  isFirst?: boolean
  isLast?: boolean
}

/**
 * Display item for an income source in a grouped list
 */
export function IncomeSourceCard({ incomeSource, onClick, isFirst: _isFirst, isLast }: IncomeSourceCardProps) {
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
          <TrendingUp size={20} style={{ opacity: 0.6 }} />
          <div>
            <Text fw={500}>{incomeSource.name}</Text>
            {incomeSource.description && (
              <Text size="xs" c="dimmed">{incomeSource.description}</Text>
            )}
          </div>
        </Group>
      </Group>
    </UnstyledButton>
  )
}
