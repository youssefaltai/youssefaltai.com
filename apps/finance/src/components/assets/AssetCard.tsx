'use client'

import { Wallet } from 'lucide-react'
import { UnstyledButton, Group, Text } from '@mantine/core'
import { Money } from '../shared/Money'
import type { Account } from '@repo/db'

interface AssetCardProps {
  asset: Account
  onClick?: () => void
  isFirst?: boolean
  isLast?: boolean
}

/**
 * Display item for an asset in a grouped list
 */
export function AssetCard({ asset, onClick, isFirst: _isFirst, isLast }: AssetCardProps) {
  const balance = Number(asset.balance)

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
          <Wallet size={20} style={{ opacity: 0.6 }} />
          <div>
            <Text fw={500}>{asset.name}</Text>
            {asset.description && (
              <Text size="xs" c="dimmed">{asset.description}</Text>
            )}
          </div>
        </Group>
        <Text fw={600}>
          <Money amount={balance} currency={asset.currency} />
        </Text>
      </Group>
    </UnstyledButton>
  )
}
