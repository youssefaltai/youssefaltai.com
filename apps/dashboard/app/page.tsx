'use client'

import { PageLayout, ActionGrid, StatCard, DashboardWidget, Section } from '@repo/ui'
import { TrendingUp, Dumbbell, Settings as SettingsIcon, CreditCard, Target } from '@repo/ui'
import { useRouter } from 'next/navigation'

export default function DashboardHome() {
  const router = useRouter()

  const actions = [
    {
      icon: CreditCard,
      label: 'Finance',
      onClick: () => router.push('/finance'),
      color: 'blue' as const,
    },
    {
      icon: Dumbbell,
      label: 'Fitness',
      onClick: () => router.push('/fitness'),
      color: 'blue' as const,
    },
    {
      icon: Target,
      label: 'Goals',
      onClick: () => {},
      color: 'neutral' as const,
    },
    {
      icon: SettingsIcon,
      label: 'Settings',
      onClick: () => {},
      color: 'neutral' as const,
    },
  ]

  return (
    <PageLayout
      title="Dashboard"
      subtitle="Your personal hub"
    >
      <div className="space-y-6">
        {/* Quick Stats */}
        <Section title="Quick Stats">
          <div className="grid grid-cols-2 gap-3">
            <StatCard
              title="Net Worth"
              value="$0"
              icon={TrendingUp}
              color="blue"
            />
            <StatCard
              title="Active Goals"
              value="0"
              icon={Target}
              color="neutral"
            />
          </div>
        </Section>

        {/* App Launcher */}
        <ActionGrid
          title="My Apps"
          actions={actions}
          columns={2}
        />

        {/* Recent Activity Widget */}
        <DashboardWidget
          title="Recent Activity"
          subtitle="Across all apps"
          isEmpty={true}
          emptyMessage="No recent activity"
        >
          <div />
        </DashboardWidget>
      </div>
    </PageLayout>
  )
}
