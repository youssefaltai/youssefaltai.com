import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { CreateCategoryInput } from '@repo/utils'

/**
 * Create a new category
 * Automatically invalidates and refetches categories
 */
export function useCreateCategory() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: CreateCategoryInput) => {
      const res = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.message || 'Failed to create category')
      }

      return res.json()
    },
    onSuccess: () => {
      // Invalidate all category queries
      queryClient.invalidateQueries({ queryKey: ['categories'] })
    },
  })
}

