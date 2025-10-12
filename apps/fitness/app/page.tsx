'use client'

import { PageLayout, ActionGrid, EmptyState, DashboardWidget, Section } from '@repo/ui'
import { Dumbbell, Plus, TrendingUp, Calendar, Target } from '@repo/ui'

export default function FitnessHome() {
  const actions = [
    {
      icon: Plus,
      label: 'Log Workout',
      onClick: () => {},
      color: 'blue' as const,
    },
    {
      icon: Target,
      label: 'Set Goal',
      onClick: () => {},
      color: 'blue' as const,
    },
    {
      icon: Calendar,
      label: 'View Schedule',
      onClick: () => {},
      color: 'neutral' as const,
    },
    {
      icon: TrendingUp,
      label: 'Progress',
      onClick: () => {},
      color: 'neutral' as const,
    },
  ]

  return (
    <PageLayout
      title="Fitness"
      subtitle="Track your workouts and reach your fitness goals"
    >
      <div className="space-y-6">
        {/* Quick Actions */}
        <ActionGrid
          title="Quick Actions"
          actions={actions}
          columns={2}
        />

        {/* Placeholder Widgets */}
        <Section title="Today's Workout">
          <DashboardWidget
            isEmpty={true}
            emptyMessage="No workout scheduled for today"
            emptyIcon={<Dumbbell className="w-8 h-8" />}
          >
            <div />
          </DashboardWidget>
        </Section>

        <Section title="Active Goals">
          <DashboardWidget
            isEmpty={true}
            emptyMessage="Set your first fitness goal"
            emptyIcon={<Target className="w-8 h-8" />}
          >
            <div />
          </DashboardWidget>
        </Section>

        {/* Empty State */}
        <div className="pt-8">
          <EmptyState
            icon={Dumbbell}
            title="Start Your Fitness Journey"
            description="Begin tracking your workouts, setting goals, and monitoring progress"
          />
        </div>
      </div>
    </PageLayout>
  )
}
