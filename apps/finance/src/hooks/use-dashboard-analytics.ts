'use client'

import { useQuery } from '@tanstack/react-query'
import type { DashboardAnalytics } from '../app/api/dashboard/analytics/route'

/**
 * Fetch dashboard analytics
 * Includes spending trends, category breakdown, month comparison, and savings rate
 * @param month - Optional month in YYYY-MM format (undefined = current month)
 */
export function useDashboardAnalytics(month?: string) {
  return useQuery<DashboardAnalytics>({
    queryKey: ['dashboard', 'analytics', month],
    queryFn: async () => {
      const url = month 
        ? `/api/dashboard/analytics?month=${month}` 
        : '/api/dashboard/analytics'
      const response = await fetch(url)

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
 * @param month - Optional month in YYYY-MM format (undefined = current month)
 */
export function useSpendingTrends(month?: string) {
  const { data, ...rest } = useDashboardAnalytics(month)
  return {
    data: data?.spendingTrends || [],
    ...rest,
  }
}

/**
 * Fetch just category breakdown
 * @param month - Optional month in YYYY-MM format (undefined = current month)
 */
export function useCategoryBreakdown(month?: string) {
  const { data, ...rest } = useDashboardAnalytics(month)
  return {
    data: data?.categoryBreakdown || [],
    ...rest,
  }
}

/**
 * Fetch just month comparison
 * @param month - Optional month in YYYY-MM format (undefined = current month)
 */
export function useMonthComparison(month?: string) {
  const { data, ...rest } = useDashboardAnalytics(month)
  return {
    data: data?.monthComparison,
    ...rest,
  }
}

/**
 * Fetch just savings rate
 * @param month - Optional month in YYYY-MM format (undefined = current month)
 */
export function useSavingsRate(month?: string) {
  const { data, ...rest } = useDashboardAnalytics(month)
  return {
    data: data?.savingsRate || 0,
    ...rest,
  }
}

