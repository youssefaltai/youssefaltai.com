'use client'

import { Container, Title, Text, Paper, SimpleGrid, Stack, Group, UnstyledButton } from '@mantine/core'
import { TrendingUp, Dumbbell, Settings as SettingsIcon, CreditCard, Target } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function DashboardHome() {
  const router = useRouter()

  const actions = [
    {
      icon: CreditCard,
      label: 'Finance',
      onClick: () => router.push('/finance'),
    },
    {
      icon: Dumbbell,
      label: 'Fitness',
      onClick: () => router.push('/fitness'),
    },
    {
      icon: Target,
      label: 'Goals',
      onClick: () => {},
    },
    {
      icon: SettingsIcon,
      label: 'Settings',
      onClick: () => {},
    },
  ]

  return (
    <Container size="lg" py="xl">
      <Stack gap="xl">
        {/* Header */}
        <div>
          <Title order={1} size="h2">Dashboard</Title>
          <Text c="dimmed">Your personal hub</Text>
        </div>

        {/* Quick Stats */}
        <div>
          <Title order={2} size="h4" mb="md">Quick Stats</Title>
          <SimpleGrid cols={{ base: 2, sm: 2 }} spacing="md">
            <Paper p="lg" withBorder>
              <Group gap="sm" mb="xs">
                <TrendingUp size={24} />
                <Text size="sm" c="dimmed">Net Worth</Text>
              </Group>
              <Text size="xl" fw={700}>$0</Text>
            </Paper>
            <Paper p="lg" withBorder>
              <Group gap="sm" mb="xs">
                <Target size={24} />
                <Text size="sm" c="dimmed">Active Goals</Text>
              </Group>
              <Text size="xl" fw={700}>0</Text>
            </Paper>
          </SimpleGrid>
        </div>

        {/* App Launcher */}
        <div>
          <Title order={2} size="h4" mb="md">My Apps</Title>
          <SimpleGrid cols={{ base: 2, sm: 2 }} spacing="md">
            {actions.map((action) => {
              const Icon = action.icon
              return (
                <UnstyledButton key={action.label} onClick={action.onClick}>
                  <Paper p="lg" withBorder style={{ cursor: 'pointer', transition: 'all 0.2s' }} 
                    onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
                    onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}>
                    <Stack align="center" gap="sm">
                      <Icon size={32} />
                      <Text fw={500}>{action.label}</Text>
                    </Stack>
                  </Paper>
                </UnstyledButton>
              )
            })}
          </SimpleGrid>
        </div>

        {/* Recent Activity */}
        <Paper p="lg" withBorder>
          <Title order={2} size="h4" mb="sm">Recent Activity</Title>
          <Text c="dimmed" size="sm" mb="md">Across all apps</Text>
          <Text c="dimmed" ta="center" py="xl">No recent activity</Text>
        </Paper>
      </Stack>
    </Container>
  )
}
