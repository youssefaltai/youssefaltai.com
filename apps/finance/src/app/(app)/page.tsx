'use client'

import { useState } from 'react'
import { ChevronRight, Settings } from 'lucide-react'
import { Container, ActionIcon, Paper, Text, Title, SimpleGrid, Progress, Group, UnstyledButton, Stack, Button, Modal } from '@mantine/core'
import { useRouter } from 'next/navigation'
import { Money } from '../../components/shared'
import { TransactionItem } from '../../components/transactions/TransactionItem'
import { useDashboardSummary, useRecentTransactions, useActiveGoals } from '../../hooks/use-dashboard'
import { useIsWidgetVisible } from '../../hooks/use-widget-preferences'
import { TTransaction } from '@repo/db'
import { calculateGoalProgress } from '../../utils/calculations'
import { getGreeting, format, parseISO } from '@repo/utils'
import { AlertsWidget } from '../../components/dashboard/AlertsWidget'
import { FinancialHealthWidget } from '../../components/dashboard/FinancialHealthWidget'
import { SpendingTrendsChart } from '../../components/dashboard/SpendingTrendsChart'
import { CategoryBreakdownChart } from '../../components/dashboard/CategoryBreakdownChart'
import { MonthComparisonWidget } from '../../components/dashboard/MonthComparisonWidget'
import { QuickStatsWidget } from '../../components/dashboard/QuickStatsWidget'
import { AccountBalancesWidget } from '../../components/dashboard/AccountBalancesWidget'
import { InsightsWidget } from '../../components/dashboard/InsightsWidget'
import { WidgetSettings } from '../../components/dashboard/WidgetSettings'
import { MonthSelector } from '../../components/dashboard/MonthSelector'

export default function HomePage() {
  const router = useRouter()
  const [selectedMonth, setSelectedMonth] = useState<string | undefined>(undefined)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  
  const { data: summary } = useDashboardSummary(selectedMonth)
  const { data: recentTransactions = [] } = useRecentTransactions(5)
  const { data: activeGoals = [] } = useActiveGoals()

  // Widget visibility checks
  const showNetWorth = useIsWidgetVisible('net-worth')
  const showAlerts = useIsWidgetVisible('alerts')
  const showFinancialHealth = useIsWidgetVisible('financial-health')
  const showSpendingTrends = useIsWidgetVisible('spending-trends')
  const showCategoryBreakdown = useIsWidgetVisible('category-breakdown')
  const showMonthComparison = useIsWidgetVisible('month-comparison')
  const showQuickStats = useIsWidgetVisible('quick-stats')
  const showGoals = useIsWidgetVisible('goals')
  const showAccountBalances = useIsWidgetVisible('account-balances')
  const showInsights = useIsWidgetVisible('insights')
  const showRecentTransactions = useIsWidgetVisible('recent-transactions')

  // Check if any widgets are visible
  const hasAnyWidgets = showNetWorth || showAlerts || showFinancialHealth ||
    showSpendingTrends || showCategoryBreakdown || showMonthComparison ||
    showQuickStats || showGoals || showAccountBalances || showInsights || showRecentTransactions

  // Get display month for subtitles
  const displayMonth = selectedMonth 
    ? format(parseISO(`${selectedMonth}-01`), 'MMMM yyyy')
    : format(new Date(), 'MMMM yyyy')

  return (
    <>
      <Container size="lg" p="md" pb={96}>
        {/* Page Header - Always visible */}
        <Group justify="space-between" align="flex-start" w="100%" mb="md">
          <div>
            <Title order={1} size="h2">Good {getGreeting()}</Title>
            <Text c="dimmed" size="sm" mt={4}>Track your finances in one place</Text>
          </div>
          <ActionIcon
            onClick={() => setIsSettingsOpen(true)}
            size="lg"
            variant="light"
            aria-label="Widget Settings"
          >
            <Settings size={24} />
          </ActionIcon>
        </Group>

        {/* Month Selector */}
        <MonthSelector 
          selectedMonth={selectedMonth}
          onChange={setSelectedMonth}
        />

        {/* Hero Section - Net Worth */}
        {showNetWorth && (
          <Paper p="xl" mb="lg" withBorder shadow="sm">
            <Text size="sm" c="dimmed" mb={4}>Total Net Worth</Text>
            <Title order={1} size="h1" mb="md">
              {summary ? <Money amount={summary.netWorth} currency='EGP' /> : '—'}
            </Title>

            <SimpleGrid cols={2} spacing="md" style={{ paddingTop: '1rem', borderTop: '1px solid var(--mantine-color-gray-3)' }}>
              <div>
                <Text size="xs" c="dimmed" mb={4}>{displayMonth} Income</Text>
                <Text size="md" fw={600}>
                  {summary ? <Money amount={summary.thisMonthIncome} currency='EGP' /> : '—'}
                </Text>
              </div>
              <div>
                <Text size="xs" c="dimmed" mb={4}>{displayMonth} Expenses</Text>
                <Text size="md" fw={600}>
                  {summary ? <Money amount={summary.thisMonthExpenses} currency='EGP' /> : '—'}
                </Text>
              </div>
            </SimpleGrid>
          </Paper>
        )}

        {/* Dashboard Widgets */}
        <Stack gap="lg">
          {/* Empty state when no widgets are visible */}
          {!hasAnyWidgets && (
            <Paper p="xl" withBorder shadow="sm" style={{ textAlign: 'center' }}>
              <Settings size={64} style={{ margin: '0 auto', opacity: 0.3, marginBottom: '1rem' }} />
              <Title order={3} size="h3" mb="sm">
                No Widgets Enabled
              </Title>
              <Text c="dimmed" mb="lg">
                You&apos;ve hidden all dashboard widgets. Enable some widgets to see your financial data.
              </Text>
              <Button
                onClick={() => setIsSettingsOpen(true)}
                leftSection={<Settings size={20} />}
              >
                Open Widget Settings
              </Button>
            </Paper>
          )}

          {/* Alerts Widget */}
          {showAlerts && <AlertsWidget />}

          {/* Financial Health Widget */}
          {showFinancialHealth && <FinancialHealthWidget />}

          {/* Charts Section */}
          {showSpendingTrends && <SpendingTrendsChart selectedMonth={selectedMonth} />}
          {showCategoryBreakdown && <CategoryBreakdownChart selectedMonth={selectedMonth} />}

          {/* Month Comparison */}
          {showMonthComparison && <MonthComparisonWidget selectedMonth={selectedMonth} />}

          {/* Quick Stats */}
          {showQuickStats && <QuickStatsWidget selectedMonth={selectedMonth} />}

          {/* Active Goals */}
          {showGoals && activeGoals.length > 0 && (
            <div>
              <Group justify="space-between" mb="sm">
                <Title order={3} size="h4">Your Goals</Title>
                <UnstyledButton onClick={() => router.push('/goals')}>
                  <Group gap="xs" c="blue">
                    <Text size="sm">See All</Text>
                    <ChevronRight size={16} />
                  </Group>
                </UnstyledButton>
              </Group>

              <Paper withBorder>
                <Stack gap={0}>
                  {activeGoals.slice(0, 3).map((goal, index) => {
                    const progress = goal.target
                      ? calculateGoalProgress(Number(goal.balance), Number(goal.target))
                      : 0

                    return (
                      <UnstyledButton
                        key={goal.id}
                        onClick={() => router.push('/goals')}
                        style={{ 
                          width: '100%',
                          padding: '1rem',
                          textAlign: 'left',
                          borderBottom: index < activeGoals.slice(0, 3).length - 1 ? '1px solid var(--mantine-color-gray-3)' : 'none'
                        }}
                      >
                        <Group justify="space-between" mb="xs">
                          <Text fw={600}>{goal.name}</Text>
                          <Text fw={600} c="blue">{Math.round(progress)}%</Text>
                        </Group>

                        <Progress value={progress} size="sm" mb="xs" />

                        <Text size="xs" c="dimmed">
                          <Money amount={Number(goal.balance)} currency={goal.currency} /> of{' '}
                          <Money amount={Number(goal.target)} currency={goal.currency} />
                        </Text>
                      </UnstyledButton>
                    )
                  })}
                </Stack>
              </Paper>
            </div>
          )}

          {/* Account Balances */}
          {showAccountBalances && <AccountBalancesWidget />}

          {/* Insights */}
          {showInsights && <InsightsWidget />}

          {/* Recent Transactions */}
          {showRecentTransactions && recentTransactions.length > 0 && (
            <div>
              <Group justify="space-between" mb="sm">
                <Title order={3} size="h4">Recent Activity</Title>
                <UnstyledButton onClick={() => router.push('/transactions')}>
                  <Group gap="xs" c="blue">
                    <Text size="sm">See All</Text>
                    <ChevronRight size={16} />
                  </Group>
                </UnstyledButton>
              </Group>

              <Paper withBorder radius="md">
                <Stack gap={0}>
                  {recentTransactions.slice(0, 5).map((transaction: TTransaction, index: number) => (
                    <TransactionItem
                      key={transaction.id}
                      transaction={transaction}
                      onClick={() => router.push('/transactions')}
                      isFirst={index === 0}
                      isLast={index === recentTransactions.slice(0, 5).length - 1}
                    />
                  ))}
                </Stack>
              </Paper>
            </div>
          )}
        </Stack>
      </Container>

      {/* Widget Settings Modal */}
      <Modal
        opened={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        title="Widget Settings"
        centered
        size="md"
      >
        <WidgetSettings onClose={() => setIsSettingsOpen(false)} />
      </Modal>
    </>
  )
}
