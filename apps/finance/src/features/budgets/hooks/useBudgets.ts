import { useQuery } from '@tanstack/react-query'
import type { Budget } from '@repo/types'
import type { BudgetFilters } from '../validation'

async function fetchBudgets(filters?: BudgetFilters): Promise<Budget[]> {
    const params = new URLSearchParams()

    if (filters?.categories && filters.categories.length > 0) {
        params.append('categories', filters.categories.join(','))
    }
    if (filters?.dateFrom) params.append('dateFrom', filters.dateFrom)
    if (filters?.dateTo) params.append('dateTo', filters.dateTo)

    const url = `/api/budgets${params.toString() ? `?${params.toString()}` : ''}`
    const response = await fetch(url)

    if (!response.ok) {
        throw new Error('Failed to fetch budgets')
    }

    return response.json()
}

export function useBudgets(filters?: BudgetFilters) {
    return useQuery({
        queryKey: ['budgets', filters],
        queryFn: () => fetchBudgets(filters),
        staleTime: 1000 * 60, // 1 minute
    })
}

