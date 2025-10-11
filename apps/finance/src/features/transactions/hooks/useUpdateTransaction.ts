import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { UpdateTransactionInput } from '../validation'

/**
 * Hook to update a transaction
 * Automatically invalidates transactions and summary cache on success
 */
export function useUpdateTransaction(transactionId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: UpdateTransactionInput) => {
      const response = await fetch(`/api/transactions/${transactionId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to update transaction')
      }

      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] })
      queryClient.invalidateQueries({ queryKey: ['summary'] })
    },
  })
}

