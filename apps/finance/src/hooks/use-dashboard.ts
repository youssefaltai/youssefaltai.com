'use client'

import { useQuery } from '@tanstack/react-query'
import { useAssets } from './use-assets'
import { useGoals } from './use-goals'
import { useLoans } from './use-loans'
import { useCreditCards } from './use-credit-cards'
import { calculateNetWorth, calculateTotalBalance } from '../utils/calculations'

interface DashboardSummary {
  totalBalance: number
  netWorth: number
  thisMonthIncome: number
  thisMonthExpenses: number
}

/**
 * Fetch dashboard summary data
 * Aggregates data from multiple sources
 */
export function useDashboardSummary() {
  const { data: assets = [] } = useAssets()
  const { data: goals = [] } = useGoals()
  const { data: loans = [] } = useLoans()
  const { data: creditCards = [] } = useCreditCards()

  return useQuery<DashboardSummary>({
    queryKey: ['dashboard', 'summary'],
    queryFn: async () => {
      // Combine all accounts
      const allAccounts = [...assets, ...goals, ...loans, ...creditCards]

      // Calculate totals
      const totalBalance = calculateTotalBalance(allAccounts, 'asset')
      const netWorth = calculateNetWorth(allAccounts)

      // TODO: Implement proper income/expense calculation based on account types
      // For now, just return 0 until we have the full transaction data with account types
      const thisMonthIncome = 0
      const thisMonthExpenses = 0

      return {
        totalBalance,
        netWorth,
        thisMonthIncome,
        thisMonthExpenses,
      }
    },
    enabled: assets.length > 0 || loans.length > 0, // Only run when we have data
  })
}

/**
 * Fetch recent transactions for dashboard
 */
export function useRecentTransactions(limit: number = 5) {
  return useQuery({
    queryKey: ['dashboard', 'recent-transactions', limit],
    queryFn: async () => {
      const response = await fetch(`/api/transactions?limit=${limit}`)
      if (!response.ok) {
        throw new Error('Failed to fetch recent transactions')
      }
      const data = await response.json()
      return data.data
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
            return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
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

