import { useQuery } from '@tanstack/react-query'
import type { Transaction, TransactionFilters } from '@repo/utils'

/**
 * Fetch transactions with optional filters
 * Data is cached for 5 minutes and automatically refetched when stale
 */
export function useTransactions(filters?: TransactionFilters) {
  return useQuery({
    queryKey: ['transactions', filters ?? null],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (filters?.type) params.append('type', filters.type)
      if (filters?.limit) params.append('limit', String(filters.limit))
      if (filters?.category) params.append('category', filters.category)

      const res = await fetch(`/api/transactions?${params}`)
      if (!res.ok) {
        throw new Error('Failed to fetch transactions')
      }
      const data = await res.json()
      // TanStack Query requires non-undefined return, use [] as fallback
      return (data.data ?? []) as Transaction[]
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  })
}

