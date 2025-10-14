'use client'

import { SimpleGrid, Paper, Title, Text, Group, Skeleton, Stack } from '@mantine/core'
import { Wallet, CreditCard, TrendingUp, PiggyBank } from 'lucide-react'
import { WidgetStat } from './WidgetStat'
import { useDashboardSummary } from '../../hooks/use-dashboard'
import { useAccounts } from '../../hooks/use-accounts'
import { convertAmount, ExchangeRateMap } from '../../shared/finance-utils'
import { useExchangeRates } from '../../hooks/use-exchange-rates'
import { calculateCreditUtilization } from '../../utils/calculations'

interface QuickStatsWidgetProps {
  selectedMonth?: string
}

/**
 * Quick stats widget
 * Shows key financial metrics at a glance
 */
export function QuickStatsWidget({ selectedMonth }: QuickStatsWidgetProps) {
  const { data: summary, isLoading: summaryLoading } = useDashboardSummary(selectedMonth)
  const { data: accounts, isLoading: accountsLoading } = useAccounts()
  const { data: rates } = useExchangeRates()

  const isLoading = summaryLoading || accountsLoading

  // Calculate stats
  const baseCurrency = 'EGP' // TODO: Get from user profile

  // Build rate map
  const rateMap: ExchangeRateMap = new Map()
  if (rates) {
    for (const rate of rates) {
      const key = `${rate.fromCurrency}_TO_${rate.toCurrency}`
      rateMap.set(key, rate.rate)
    }
  }

  // Liquid assets (cash, bank accounts)
  const liquidAssets =
    accounts
      ?.filter((acc) => acc.type === 'asset')
      .reduce((sum, acc) => {
        try {
          return sum + Number(convertAmount(acc.balance, acc.currency, baseCurrency, rateMap))
        } catch {
          return sum
        }
      }, 0) || 0

  // Total debt
  const totalDebt =
    accounts
      ?.filter((acc) => acc.type === 'liability')
      .reduce((sum, acc) => {
        try {
          return sum + Number(convertAmount(acc.balance, acc.currency, baseCurrency, rateMap))
        } catch {
          return sum
        }
      }, 0) || 0

  // Average credit utilization
  const creditCards = accounts?.filter((acc) => acc.type === 'liability' && acc.target) || []
  const avgUtilization =
    creditCards.length > 0
      ? creditCards.reduce((sum, card) => {
          if (!card.target) return sum
          return sum + calculateCreditUtilization(Number(card.balance), Number(card.target))
        }, 0) / creditCards.length
      : 0

  // Savings this month
  const savings = (summary?.thisMonthIncome || 0) - (summary?.thisMonthExpenses || 0)

  return (
    <Paper withBorder shadow="sm">
      <Group justify="space-between" p="md" style={{ borderBottom: '1px solid var(--mantine-color-gray-3)' }}>
        <div>
          <Title order={3} size="h4">Quick Stats</Title>
          <Text size="xs" c="dimmed" mt={2}>Key metrics at a glance</Text>
        </div>
      </Group>

      <div style={{ padding: '1rem' }}>
        {isLoading ? (
          <Stack gap="sm">
            <Skeleton height={16} />
            <Skeleton height={16} width="75%" />
            <Skeleton height={16} width="50%" />
          </Stack>
        ) : (
          <SimpleGrid cols={2} spacing="md">
            <WidgetStat
              label="Liquid Assets"
              value={liquidAssets}
              currency={baseCurrency}
              icon={<Wallet size={16} />}
            />
            <WidgetStat
              label="Total Debt"
              value={totalDebt}
              currency={baseCurrency}
              icon={<CreditCard size={16} />}
            />
            <WidgetStat
              label="Credit Utilization"
              value={avgUtilization}
              currency='EGP'
              changeType={avgUtilization > 70 ? 'negative' : avgUtilization < 30 ? 'positive' : 'neutral'}
              icon={<TrendingUp size={16} />}
            />
            <WidgetStat
              label="Monthly Savings"
              value={savings}
              currency={baseCurrency}
              changeType={savings > 0 ? 'positive' : savings < 0 ? 'negative' : 'neutral'}
              icon={<PiggyBank size={16} />}
            />
          </SimpleGrid>
        )}
      </div>
    </Paper>
  )
}
