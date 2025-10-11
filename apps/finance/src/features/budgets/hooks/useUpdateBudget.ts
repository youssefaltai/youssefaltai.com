import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { UpdateBudgetInput } from '../validation'

async function updateBudget(id: string, data: UpdateBudgetInput) {
  const response = await fetch(`/api/budgets/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || 'Failed to update budget')
  }

  return response.json()
}

export function useUpdateBudget(budgetId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: UpdateBudgetInput) =>
      updateBudget(budgetId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgets'] })
    },
  })
}


