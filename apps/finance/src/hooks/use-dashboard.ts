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

      // Calculate current month date range
      const now = new Date()
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
      const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999).toISOString()

      // Fetch this month's transactions
      const params = new URLSearchParams({
        dateFrom: monthStart,
        dateTo: monthEnd,
        limit: '1000', // Get all transactions for the month
      })

      const response = await fetch(`/api/transactions?${params.toString()}`)
      if (!response.ok) {
        throw new Error('Failed to fetch transactions for dashboard')
      }
      
      const transactionData = await response.json()
      const transactions = transactionData.data?.data || []

      // Calculate income and expenses based on transaction types
      let thisMonthIncome = 0
      let thisMonthExpenses = 0

      transactions.forEach((transaction: any) => {
        const amount = Number(transaction.amount)
        const fromType = transaction.fromAccount?.type
        const toType = transaction.toAccount?.type

        // Income: FROM income account TO asset account
        if (fromType === 'income' && toType === 'asset') {
          thisMonthIncome += amount
        }
        
        // Expense: FROM asset account TO expense account
        if (fromType === 'asset' && toType === 'expense') {
          thisMonthExpenses += amount
        }
      })

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

