/**
 * Hook for fetching budget progress (spending calculation)
 */
import { useQuery } from '@tanstack/react-query'
import type { BudgetProgress } from '../features/budgets'

export function useBudgetProgress(budgetId: string | null | undefined) {
  return useQuery<BudgetProgress>({
    queryKey: ['budget-progress', budgetId],
    queryFn: async () => {
      const response = await fetch(`/api/budgets/${budgetId}/progress`)
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to fetch budget progress')
      }
      const data = await response.json()
      return data.data
    },
    enabled: !!budgetId,
  })
}

