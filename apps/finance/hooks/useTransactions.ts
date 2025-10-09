import { useQuery } from '@tanstack/react-query'

interface Transaction {
  id: string
  amount: number
  currency: string
  baseAmount: number
  baseCurrency: string
  type: 'income' | 'expense'
  category: string
  description?: string
  date: string
  createdAt: string
}

interface TransactionFilters {
  type?: 'income' | 'expense'
  limit?: number
  category?: string
}

/**
 * Fetch transactions with optional filters
 * Data is cached for 5 minutes and automatically refetched when stale
 */
export function useTransactions(filters?: TransactionFilters) {
  return useQuery({
    queryKey: ['transactions', filters],
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
      return (data.data || []) as Transaction[]
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  })
}

