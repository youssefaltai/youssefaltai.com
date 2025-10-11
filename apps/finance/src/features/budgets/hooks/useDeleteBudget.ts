import { useMutation, useQueryClient } from '@tanstack/react-query'

async function deleteBudget(id: string): Promise<void> {
  const response = await fetch(`/api/budgets/${id}`, {
    method: 'DELETE',
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || 'Failed to delete budget')
  }
}

export function useDeleteBudget() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteBudget,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgets'] })
    },
  })
}

