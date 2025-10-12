'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ExchangeRate } from '@repo/db'
import { SetExchangeRateSchema } from '../features/exchange-rates/validation'

/**
 * Fetch all exchange rates for the authenticated user
 */
export function useExchangeRates() {
  return useQuery<ExchangeRate[]>({
    queryKey: ['exchange-rates'],
    queryFn: async () => {
      const response = await fetch('/api/exchange-rates')
      if (!response.ok) {
        throw new Error('Failed to fetch exchange rates')
      }
      const { data } = await response.json()
      return data
    },
  })
}

/**
 * Set or update an exchange rate
 */
export function useSetExchangeRate() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: SetExchangeRateSchema) => {
      const response = await fetch('/api/exchange-rates', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to set exchange rate')
      }

      const { data } = await response.json()
      return data
    },
    onSuccess: () => {
      // Invalidate exchange rates query to refetch
      queryClient.invalidateQueries({ queryKey: ['exchange-rates'] })
      // Also invalidate dashboard since it depends on exchange rates
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
    },
  })
}

