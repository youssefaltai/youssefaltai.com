'use client'

import { useQuery } from '@tanstack/react-query'
import type { DashboardInsights } from '../app/api/dashboard/insights/route'

/**
 * Fetch dashboard insights
 * Includes calculated insights, health score, and largest transactions
 * Automatically refreshes when transactions change
 */
export function useDashboardInsights() {
  return useQuery<DashboardInsights>({
    queryKey: ['dashboard', 'insights'],
    queryFn: async () => {
      const response = await fetch('/api/dashboard/insights')

      if (!response.ok) {
        throw new Error('Failed to fetch dashboard insights')
      }

      const { data } = await response.json()
      return data
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false,
  })
}

/**
 * Get just the financial health score with metadata
 */
export function useFinancialHealthScore() {
  const { data, ...rest } = useDashboardInsights()
  return {
    data: data?.healthScoreMetadata || {
      score: 0,
      label: 'Unknown',
      color: 'text-ios-gray-2',
      tips: [],
    },
    ...rest,
  }
}

/**
 * Get just the insights array
 */
export function useInsights() {
  const { data, ...rest } = useDashboardInsights()
  return {
    data: data?.insights || [],
    ...rest,
  }
}

