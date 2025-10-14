'use client'

import { useState } from 'react'
import { Wallet, ChevronDown, ChevronUp } from 'lucide-react'
import { Stack, Group, Text, Button, Paper, Title, Skeleton } from '@mantine/core'
import { useAccounts } from '../../hooks/use-accounts'
import { Money } from '../shared/Money'

/**
 * Account balances widget
 * Shows all asset accounts with expandable view
 */
export function AccountBalancesWidget() {
  const { data: accounts, isLoading, error } = useAccounts()
  const [isExpanded, setIsExpanded] = useState(false)

  const assetAccounts = accounts?.filter((acc) => acc.type === 'asset') || []
  const displayAccounts = isExpanded ? assetAccounts : assetAccounts.slice(0, 3)

  return (
    <Paper withBorder shadow="sm">
      <Group justify="space-between" p="md" style={{ borderBottom: '1px solid var(--mantine-color-gray-3)' }}>
        <div>
          <Title order={3} size="h4">Account Balances</Title>
          <Text size="xs" c="dimmed" mt={2}>
            {assetAccounts.length} {assetAccounts.length === 1 ? 'account' : 'accounts'}
          </Text>
        </div>
      </Group>

      <div style={{ padding: '1rem' }}>
        {error ? (
          <Text c="red" ta="center" py="xl">
            {error instanceof Error ? error.message : 'Failed to load accounts'}
          </Text>
        ) : isLoading ? (
          <Stack gap="sm">
            <Skeleton height={16} />
            <Skeleton height={16} width="75%" />
            <Skeleton height={16} width="50%" />
          </Stack>
        ) : assetAccounts.length === 0 ? (
          <Stack align="center" gap="sm" py="xl">
            <div style={{ opacity: 0.5 }}>
              <Wallet size={48} />
            </div>
            <Text c="dimmed">No accounts yet</Text>
          </Stack>
        ) : (
          <Stack gap="md">
            {displayAccounts.map((account, index) => (
              <Group
                key={account.id}
                justify="space-between"
                pb="sm"
                style={{
                  borderBottom: index < displayAccounts.length - 1 ? '1px solid var(--mantine-color-gray-3)' : 'none'
                }}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <Text fw={500} truncate="end">
                    {account.name}
                  </Text>
                  {account.description && (
                    <Text size="xs" c="dimmed" truncate="end">
                      {account.description}
                    </Text>
                  )}
                </div>
                <Text fw={600} style={{ marginLeft: '1rem' }}>
                  <Money amount={Number(account.balance)} currency={account.currency} />
                </Text>
              </Group>
            ))}

            {/* Expand/Collapse button */}
            {assetAccounts.length > 3 && (
              <Button
                onClick={() => setIsExpanded(!isExpanded)}
                variant="subtle"
                fullWidth
                rightSection={isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              >
                {isExpanded ? 'Show Less' : `Show ${assetAccounts.length - 3} More`}
              </Button>
            )}
          </Stack>
        )}
      </div>
    </Paper>
  )
}
