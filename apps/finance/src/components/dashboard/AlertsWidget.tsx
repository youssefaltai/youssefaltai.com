'use client'

import { useRouter } from 'next/navigation'
import { DashboardWidget } from './DashboardWidget'
import { useDashboardAlerts } from '../../hooks/use-dashboard-alerts'
import { CreditCard, Calendar, AlertTriangle, Target, ChevronRight } from '@repo/ui'
import { cn } from '@repo/utils'
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
        return <CreditCard className="w-5 h-5" />
      case 'due-date':
      case 'overdue':
        return <Calendar className="w-5 h-5" />
      case 'goal-deadline':
        return <Target className="w-5 h-5" />
      default:
        return <AlertTriangle className="w-5 h-5" />
    }
  }

  const getSeverityColor = (severity: AlertSeverity) => {
    switch (severity) {
      case 'high':
        return 'text-ios-red'
      case 'medium':
        return 'text-ios-orange'
      case 'low':
        return 'text-ios-blue'
    }
  }

  const getSeverityBg = (severity: AlertSeverity) => {
    switch (severity) {
      case 'high':
        return 'bg-red-50'
      case 'medium':
        return 'bg-orange-50'
      case 'low':
        return 'bg-blue-50'
    }
  }

  // Don't render if no alerts
  if (!isLoading && !error && (!alerts || alerts.length === 0)) {
    return null
  }

  return (
    <DashboardWidget
      title="Alerts"
      subtitle={`${alerts?.length || 0} active ${alerts?.length === 1 ? 'alert' : 'alerts'}`}
      loading={isLoading}
      error={error instanceof Error ? error.message : null}
      isEmpty={!alerts || alerts.length === 0}
      emptyMessage="No alerts - everything looks good!"
      emptyIcon={<AlertTriangle className="w-12 h-12" />}
    >
      <div className="space-y-2">
        {alerts?.map((alert) => (
          <button
            key={alert.id}
            onClick={() => alert.actionUrl && router.push(alert.actionUrl)}
            className={cn(
              'w-full p-3 rounded-ios border transition-colors text-left',
              getSeverityBg(alert.severity),
              'border-transparent hover:border-ios-gray-4 active:scale-[0.98]'
            )}
          >
            <div className="flex items-start gap-3">
              <div className={cn('flex-shrink-0 mt-0.5', getSeverityColor(alert.severity))}>
                {getAlertIcon(alert.type)}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-ios-body font-semibold text-ios-label-primary mb-0.5">
                  {alert.title}
                </h4>
                <p className="text-ios-callout text-ios-gray-1">{alert.message}</p>
              </div>
              {alert.actionUrl && (
                <ChevronRight className="flex-shrink-0 w-5 h-5 text-ios-gray-2 mt-0.5" />
              )}
            </div>
          </button>
        ))}
      </div>
    </DashboardWidget>
  )
}

