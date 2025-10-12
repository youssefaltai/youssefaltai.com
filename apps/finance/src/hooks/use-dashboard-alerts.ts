'use client'

import { useQuery } from '@tanstack/react-query'
import type { Alert } from '../app/api/dashboard/alerts/route'

/**
 * Fetch dashboard alerts
 * Includes credit utilization warnings, due dates, and overdue payments
 * Polls every 5 minutes for updates
 */
export function useDashboardAlerts() {
  return useQuery<Alert[]>({
    queryKey: ['dashboard', 'alerts'],
    queryFn: async () => {
      const response = await fetch('/api/dashboard/alerts')

      if (!response.ok) {
        throw new Error('Failed to fetch dashboard alerts')
      }

      const { data } = await response.json()
      return data
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchInterval: 1000 * 60 * 5, // Poll every 5 minutes
    refetchOnWindowFocus: true, // Refetch when user returns to tab
  })
}

/**
 * Get count of high severity alerts
 */
export function useHighSeverityAlertCount() {
  const { data: alerts } = useDashboardAlerts()
  return alerts?.filter((alert) => alert.severity === 'high').length || 0
}

/**
 * Get alerts by type
 */
export function useAlertsByType(type: Alert['type']) {
  const { data: alerts, ...rest } = useDashboardAlerts()
  return {
    data: alerts?.filter((alert) => alert.type === type) || [],
    ...rest,
  }
}

/**
 * Check if there are any alerts
 */
export function useHasAlerts(): boolean {
  const { data: alerts } = useDashboardAlerts()
  return (alerts?.length || 0) > 0
}

