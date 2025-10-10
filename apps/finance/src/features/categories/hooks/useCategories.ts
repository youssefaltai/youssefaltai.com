import { useQuery } from '@tanstack/react-query'
import type { Category, CategoryFilters } from '@repo/types'

/**
 * Fetch categories with optional type filter
 * Data is cached for 10 minutes (categories change less frequently)
 */
export function useCategories(filters?: CategoryFilters) {
  return useQuery({
    queryKey: ['categories', filters ?? null],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (filters?.type) params.append('type', filters.type)

      const res = await fetch(`/api/categories?${params}`)
      if (!res.ok) {
        throw new Error('Failed to fetch categories')
      }
      const data = await res.json()
      // TanStack Query requires non-undefined return, use [] as fallback
      return (data.categories ?? []) as Category[]
    },
    staleTime: 1000 * 60 * 10, // 10 minutes
  })
}

