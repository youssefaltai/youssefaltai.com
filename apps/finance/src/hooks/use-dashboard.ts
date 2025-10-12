'use client'

import { useQuery } from '@tanstack/react-query'
import { parseISO, compareAsc } from '@repo/utils'
import { useGoals } from './use-goals'

interface DashboardSummary {
  totalBalance: number
  netWorth: number
  thisMonthIncome: number
  thisMonthExpenses: number
}

/**
 * Fetch dashboard summary from server
 * All calculations and currency conversions done server-side
 */
export function useDashboardSummary() {
  return useQuery<DashboardSummary>({
    queryKey: ['dashboard', 'summary'],
    queryFn: async () => {
      const response = await fetch('/api/dashboard/summary')
      
      if (!response.ok) {
        throw new Error('Failed to fetch dashboard summary')
      }

      const { data } = await response.json()
      return data
    },
  })
}

/**
 * Fetch recent transactions for dashboard
 */
export function useRecentTransactions(limit: number = 5) {
  return useQuery({
    queryKey: ['dashboard', 'recent-transactions', limit],
    queryFn: async () => {
      const response = await fetch(`/api/transactions?limit=${limit}&sortBy=date&sortOrder=desc`)
      if (!response.ok) {
        throw new Error('Failed to fetch recent transactions')
      }
      const data = await response.json()
      // Extract transactions array from paginated response
      return data.data?.data || []
    },
  })
}

/**
 * Fetch active goals for dashboard
 */
export function useActiveGoals() {
  const { data: goals = [] } = useGoals()

  return useQuery({
    queryKey: ['dashboard', 'active-goals'],
    queryFn: async () => {
      // Filter goals that have a target and aren't completed
      const activeGoals = goals
        .filter((goal) => {
          if (!goal.target) return false
          const progress = (Number(goal.balance) / Number(goal.target)) * 100
          return progress < 100
        })
        .sort((a, b) => {
          // Sort by due date (soonest first)
          if (a.dueDate && b.dueDate) {
            const dateA = a.dueDate instanceof Date ? a.dueDate : parseISO(a.dueDate)
            const dateB = b.dueDate instanceof Date ? b.dueDate : parseISO(b.dueDate)
            return compareAsc(dateA, dateB)
          }
          if (a.dueDate) return -1
          if (b.dueDate) return 1
          return 0
        })
        .slice(0, 3) // Top 3 goals

      return activeGoals
    },
    enabled: goals.length > 0,
  })
}

