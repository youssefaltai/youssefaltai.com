'use client'

import { useRouter } from 'next/navigation'
import { CreditCard, Calendar, AlertTriangle, Target, ChevronRight } from 'lucide-react'
import { Stack, Group, Text, UnstyledButton, Paper, Title, Skeleton } from '@mantine/core'
import { useDashboardAlerts } from '../../hooks/use-dashboard-alerts'
import type { Alert, AlertSeverity } from '../../app/api/dashboard/alerts/route'

/**
 * Alerts widget
 * Shows important financial alerts with color-coded severity
 */
export function AlertsWidget() {
  const router = useRouter()
  const { data: alerts, isLoading, error } = useDashboardAlerts()

  const getAlertIcon = (type: Alert['type']) => {
    switch (type) {
      case 'credit-utilization':
        return <CreditCard size={20} />
      case 'due-date':
      case 'overdue':
        return <Calendar size={20} />
      case 'goal-deadline':
        return <Target size={20} />
      default:
        return <AlertTriangle size={20} />
    }
  }

  const getSeverityColor = (severity: AlertSeverity) => {
    switch (severity) {
      case 'high':
        return 'red'
      case 'medium':
        return 'orange'
      case 'low':
        return 'blue'
    }
  }

  // Don't render if no alerts
  if (!isLoading && !error && (!alerts || alerts.length === 0)) {
    return null
  }

  return (
    <Paper withBorder shadow="sm">
      {/* Header */}
      <Group justify="space-between" p="md" style={{ borderBottom: '1px solid var(--mantine-color-gray-3)' }}>
        <div>
          <Title order={3} size="h4">Alerts</Title>
          <Text size="xs" c="dimmed" mt={2}>
            {alerts?.length || 0} active {alerts?.length === 1 ? 'alert' : 'alerts'}
          </Text>
        </div>
      </Group>

      {/* Content */}
      <div style={{ padding: '1rem' }}>
        {error ? (
          <Text c="red" ta="center" py="xl">
            {error instanceof Error ? error.message : 'Failed to load alerts'}
          </Text>
        ) : isLoading ? (
          <Stack gap="sm">
            <Skeleton height={16} />
            <Skeleton height={16} width="75%" />
            <Skeleton height={16} width="50%" />
          </Stack>
        ) : !alerts || alerts.length === 0 ? (
          <Stack align="center" gap="sm" py="xl">
            <div style={{ opacity: 0.5 }}>
              <AlertTriangle size={48} />
            </div>
            <Text c="dimmed">No alerts - everything looks good!</Text>
          </Stack>
        ) : (
          <Stack gap="xs">
            {alerts.map((alert) => (
              <UnstyledButton
                key={alert.id}
                onClick={() => alert.actionUrl && router.push(alert.actionUrl)}
                style={{ width: '100%' }}
              >
                <Group
                  p="md"
                  gap="sm"
                  align="flex-start"
                  style={{ 
                    borderRadius: 'var(--mantine-radius-md)',
                    backgroundColor: `var(--mantine-color-${getSeverityColor(alert.severity)}-0)`,
                    border: '1px solid transparent'
                  }}
                >
                  <div style={{ color: `var(--mantine-color-${getSeverityColor(alert.severity)}-6)` }}>
                    {getAlertIcon(alert.type)}
                  </div>
                  <div style={{ flex: 1 }}>
                    <Text fw={600} size="sm" mb={2}>
                      {alert.title}
                    </Text>
                    <Text size="sm" c="dimmed">{alert.message}</Text>
                  </div>
                  {alert.actionUrl && (
                    <ChevronRight size={20} style={{ opacity: 0.5 }} />
                  )}
                </Group>
              </UnstyledButton>
            ))}
          </Stack>
        )}
      </div>
    </Paper>
  )
}
