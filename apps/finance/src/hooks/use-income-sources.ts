'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { Account } from '@repo/db'

type IncomeSource = Account

interface CreateIncomeSourceData {
  name: string
  description?: string
  currency: string
  openingBalance?: number
  openingBalanceExchangeRate?: number
}

interface UpdateIncomeSourceData {
  name?: string
  description?: string
  currency?: string
}

/**
 * Fetch all income sources for the current user
 */
export function useIncomeSources() {
  return useQuery<IncomeSource[]>({
    queryKey: ['income-sources'],
    queryFn: async () => {
      const response = await fetch('/api/income')
      if (!response.ok) {
        throw new Error('Failed to fetch income sources')
      }
      const data = await response.json()
      return data.data
    },
  })
}

/**
 * Create a new income source
 */
export function useCreateIncomeSource() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: CreateIncomeSourceData) => {
      const response = await fetch('/api/income', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to create income source')
      }

      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['income-sources'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
    },
  })
}

/**
 * Update an income source
 */
export function useUpdateIncomeSource() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateIncomeSourceData }) => {
      const response = await fetch(`/api/income/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to update income source')
      }

      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['income-sources'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
    },
  })
}

/**
 * Delete an income source
 */
export function useDeleteIncomeSource() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/income/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to delete income source')
      }

      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['income-sources'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
    },
  })
}

