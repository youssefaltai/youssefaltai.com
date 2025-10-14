'use client'

import { TrendingDown } from 'lucide-react'
import { UnstyledButton, Group, Text } from '@mantine/core'
import type { Account } from '@repo/db'

interface ExpenseCategoryCardProps {
  expenseCategory: Account
  onClick?: () => void
  isFirst?: boolean
  isLast?: boolean
}

/**
 * Display item for an expense category in a grouped list
 */
export function ExpenseCategoryCard({ expenseCategory, onClick, isFirst: _isFirst, isLast }: ExpenseCategoryCardProps) {
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
          <TrendingDown size={20} style={{ opacity: 0.6 }} />
          <div>
            <Text fw={500}>{expenseCategory.name}</Text>
            {expenseCategory.description && (
              <Text size="xs" c="dimmed">{expenseCategory.description}</Text>
            )}
          </div>
        </Group>
      </Group>
    </UnstyledButton>
  )
}
