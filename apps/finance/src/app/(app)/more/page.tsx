'use client'

import { useRouter } from 'next/navigation'
import { Container, Paper, Text, Stack, Group, Button, UnstyledButton, Title } from '@mantine/core'
import { ChevronRight } from 'lucide-react'
import { useAssets } from '../../../hooks/use-assets'
import { useCreditCards } from '../../../hooks/use-credit-cards'
import { useLoans } from '../../../hooks/use-loans'
import { useIncomeSources } from '../../../hooks/use-income-sources'
import { useExpenseCategories } from '../../../hooks/use-expense-categories'
import { ExchangeRatesManager } from '../../../components/settings/ExchangeRatesManager'

export default function MorePage() {
  const router = useRouter()
  const { data: assets = [] } = useAssets()
  const { data: creditCards = [] } = useCreditCards()
  const { data: loans = [] } = useLoans()
  const { data: incomeSources = [] } = useIncomeSources()
  const { data: expenseCategories = [] } = useExpenseCategories()

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      router.push('/login')
    }
  }

  return (
    <Container size="lg" py="md" px="md" pb={96}>
      <Stack gap="md">
        <Group justify="space-between" align="flex-start">
          <div>
            <Title order={1} size="h2">More</Title>
            <Text c="dimmed" size="sm">Settings and preferences</Text>
          </div>
        </Group>

        <Stack gap="lg">
          {/* Financial Entities */}
          <div>
            <Text fw={600} size="sm" mb="xs" c="dimmed">Financial Management</Text>
            <Paper withBorder>
              <Stack gap={0}>
                <UnstyledButton onClick={() => router.push('/assets')} style={{ width: '100%' }}>
                  <Group p="md" justify="space-between" style={{ borderBottom: '1px solid var(--mantine-color-gray-3)' }}>
                    <Text>Assets</Text>
                    <Group gap="xs">
                      {assets.length > 0 && <Text c="dimmed" size="sm">{assets.length}</Text>}
                      <ChevronRight size={16} />
                    </Group>
                  </Group>
                </UnstyledButton>
                <UnstyledButton onClick={() => router.push('/credit-cards')} style={{ width: '100%' }}>
                  <Group p="md" justify="space-between" style={{ borderBottom: '1px solid var(--mantine-color-gray-3)' }}>
                    <Text>Credit Cards</Text>
                    <Group gap="xs">
                      {creditCards.length > 0 && <Text c="dimmed" size="sm">{creditCards.length}</Text>}
                      <ChevronRight size={16} />
                    </Group>
                  </Group>
                </UnstyledButton>
                <UnstyledButton onClick={() => router.push('/loans')} style={{ width: '100%' }}>
                  <Group p="md" justify="space-between">
                    <Text>Loans</Text>
                    <Group gap="xs">
                      {loans.length > 0 && <Text c="dimmed" size="sm">{loans.length}</Text>}
                      <ChevronRight size={16} />
                    </Group>
                  </Group>
                </UnstyledButton>
              </Stack>
            </Paper>
          </div>

          {/* Categories */}
          <div>
            <Text fw={600} size="sm" mb="xs" c="dimmed">Categories</Text>
            <Paper withBorder>
              <Stack gap={0}>
                <UnstyledButton onClick={() => router.push('/income-sources')} style={{ width: '100%' }}>
                  <Group p="md" justify="space-between" style={{ borderBottom: '1px solid var(--mantine-color-gray-3)' }}>
                    <Text>Income Sources</Text>
                    <Group gap="xs">
                      {incomeSources.length > 0 && <Text c="dimmed" size="sm">{incomeSources.length}</Text>}
                      <ChevronRight size={16} />
                    </Group>
                  </Group>
                </UnstyledButton>
                <UnstyledButton onClick={() => router.push('/expense-categories')} style={{ width: '100%' }}>
                  <Group p="md" justify="space-between">
                    <Text>Expense Categories</Text>
                    <Group gap="xs">
                      {expenseCategories.length > 0 && <Text c="dimmed" size="sm">{expenseCategories.length}</Text>}
                      <ChevronRight size={16} />
                    </Group>
                  </Group>
                </UnstyledButton>
              </Stack>
            </Paper>
          </div>

          {/* Exchange Rates */}
          <ExchangeRatesManager />

          {/* Logout Button */}
          <Button
            onClick={handleLogout}
            color="red"
            size="lg"
            fullWidth
          >
            Log Out
          </Button>
        </Stack>
      </Stack>
    </Container>
  )
}
