'use client'

import { useQuery } from '@tanstack/react-query'
import type { Account } from '@repo/db'

/**
 * Fetch all accounts for the current user
 * Returns all account types (assets, goals, loans, credit cards, income sources, expense categories)
 */
export function useAccounts() {
  return useQuery<Account[]>({
    queryKey: ['accounts'],
    queryFn: async () => {
      const response = await fetch('/api/accounts')
      if (!response.ok) {
        throw new Error('Failed to fetch accounts')
      }
      const data = await response.json()
      return data.data
    },
  })
}

