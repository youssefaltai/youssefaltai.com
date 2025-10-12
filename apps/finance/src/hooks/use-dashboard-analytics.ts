'use client'

import { useQuery } from '@tanstack/react-query'
import type { DashboardAnalytics } from '../app/api/dashboard/analytics/route'

/**
 * Fetch dashboard analytics
 * Includes spending trends, category breakdown, month comparison, and savings rate
 */
export function useDashboardAnalytics() {
  return useQuery<DashboardAnalytics>({
    queryKey: ['dashboard', 'analytics'],
    queryFn: async () => {
      const response = await fetch('/api/dashboard/analytics')

      if (!response.ok) {
        throw new Error('Failed to fetch dashboard analytics')
      }

      const { data } = await response.json()
      return data
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false,
  })
}

/**
 * Fetch just spending trends
 * Useful for components that only need this data
 */
export function useSpendingTrends() {
  const { data, ...rest } = useDashboardAnalytics()
  return {
    data: data?.spendingTrends || [],
    ...rest,
  }
}

/**
 * Fetch just category breakdown
 */
export function useCategoryBreakdown() {
  const { data, ...rest } = useDashboardAnalytics()
  return {
    data: data?.categoryBreakdown || [],
    ...rest,
  }
}

/**
 * Fetch just month comparison
 */
export function useMonthComparison() {
  const { data, ...rest } = useDashboardAnalytics()
  return {
    data: data?.monthComparison,
    ...rest,
  }
}

/**
 * Fetch just savings rate
 */
export function useSavingsRate() {
  const { data, ...rest } = useDashboardAnalytics()
  return {
    data: data?.savingsRate || 0,
    ...rest,
  }
}

