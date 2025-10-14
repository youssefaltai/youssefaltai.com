'use client'

import { Container, Title, Text, Paper, SimpleGrid, Stack, Group, UnstyledButton } from '@mantine/core'
import { Dumbbell, Plus, TrendingUp, Calendar, Target } from 'lucide-react'

export default function FitnessHome() {
  const actions = [
    {
      icon: Plus,
      label: 'Log Workout',
      onClick: () => {},
    },
    {
      icon: Target,
      label: 'Set Goal',
      onClick: () => {},
    },
    {
      icon: Calendar,
      label: 'View Schedule',
      onClick: () => {},
    },
    {
      icon: TrendingUp,
      label: 'Progress',
      onClick: () => {},
    },
  ]

  return (
    <Container size="lg" py="xl">
      <Stack gap="xl">
        {/* Header */}
        <div>
          <Title order={1} size="h2">Fitness</Title>
          <Text c="dimmed">Track your workouts and reach your fitness goals</Text>
        </div>

        {/* Quick Actions */}
        <div>
          <Title order={2} size="h4" mb="md">Quick Actions</Title>
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

        {/* Today's Workout */}
        <div>
          <Title order={2} size="h4" mb="md">Today&apos;s Workout</Title>
          <Paper p="lg" withBorder>
            <Group gap="sm" mb="sm">
              <Dumbbell size={24} />
            </Group>
            <Text c="dimmed" ta="center" py="xl">No workout scheduled for today</Text>
          </Paper>
        </div>

        {/* Active Goals */}
        <div>
          <Title order={2} size="h4" mb="md">Active Goals</Title>
          <Paper p="lg" withBorder>
            <Group gap="sm" mb="sm">
              <Target size={24} />
            </Group>
            <Text c="dimmed" ta="center" py="xl">Set your first fitness goal</Text>
          </Paper>
        </div>

        {/* Empty State */}
        <Paper p="xl" withBorder style={{ textAlign: 'center' }}>
          <Dumbbell size={64} style={{ margin: '0 auto', opacity: 0.5 }} />
          <Title order={3} mt="md" mb="sm">Start Your Fitness Journey</Title>
          <Text c="dimmed">Begin tracking your workouts, setting goals, and monitoring progress</Text>
        </Paper>
      </Stack>
    </Container>
  )
}
