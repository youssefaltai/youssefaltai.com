import { useMutation, useQueryClient } from '@tanstack/react-query'

/**
 * Delete a category
 * Automatically invalidates and refetches categories
 */
export function useDeleteCategory() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (categoryId: string) => {
      const res = await fetch(`/api/categories/${categoryId}`, {
        method: 'DELETE',
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.message || 'Failed to delete category')
      }

      return res.json()
    },
    onSuccess: () => {
      // Invalidate all category queries
      queryClient.invalidateQueries({ queryKey: ['categories'] })
    },
  })
}

