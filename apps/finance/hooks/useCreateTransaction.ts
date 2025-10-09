import { useMutation, useQueryClient } from '@tanstack/react-query'

interface CreateTransactionInput {
  type: 'income' | 'expense'
  amount: number
  currency: string
  exchangeRate?: number
  categoryId: string
  description?: string
  date: string
}

/**
 * Create a new transaction
 * Automatically invalidates and refetches transactions and summary
 */
export function useCreateTransaction() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: CreateTransactionInput) => {
      const res = await fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.message || 'Failed to create transaction')
      }

      return res.json()
    },
    onSuccess: () => {
      // Invalidate and refetch all transaction queries
      queryClient.invalidateQueries({ queryKey: ['transactions'] })
      // Invalidate and refetch summary
      queryClient.invalidateQueries({ queryKey: ['summary'] })
    },
  })
}

