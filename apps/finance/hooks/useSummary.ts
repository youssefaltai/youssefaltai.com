import { useQuery } from '@tanstack/react-query'

interface Summary {
  dateFrom: string
  dateTo: string
  baseCurrency: string
  income: number
  expenses: number
  balance: number
}

interface SummaryFilters {
  dateFrom?: string
  dateTo?: string
}

/**
 * Fetch financial summary (income, expenses, balance)
 * Data is cached for 5 minutes
 */
export function useSummary(filters?: SummaryFilters) {
  return useQuery({
    queryKey: ['summary', filters ?? null],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (filters?.dateFrom) params.append('dateFrom', filters.dateFrom)
      if (filters?.dateTo) params.append('dateTo', filters.dateTo)

      const res = await fetch(`/api/summary?${params}`)
      if (!res.ok) {
        throw new Error('Failed to fetch summary')
      }
      const data = await res.json()
      // TanStack Query requires non-undefined return
      return (data.data || null) as Summary | null
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  })
}

