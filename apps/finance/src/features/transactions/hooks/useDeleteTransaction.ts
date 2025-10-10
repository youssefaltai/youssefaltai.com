import { useMutation, useQueryClient } from '@tanstack/react-query'

/**
 * Delete a transaction
 * Automatically invalidates and refetches transactions and summary
 */
export function useDeleteTransaction() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (transactionId: string) => {
            const res = await fetch(`/api/transactions/${transactionId}`, {
                method: 'DELETE',
            })

            if (!res.ok) {
                const error = await res.json()
                throw new Error(error.message || 'Failed to delete transaction')
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

