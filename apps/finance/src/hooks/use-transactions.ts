'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { TTransaction } from '@repo/db'
import type { PaginatedResponse } from '@repo/types'

interface TransactionFilters {
  dateFrom?: string
  dateTo?: string
  fromAccountIds?: string[]
  toAccountIds?: string[]
  minAmount?: number
  maxAmount?: number
  type?: 'income' | 'expense' | 'transfer'
  search?: string
  page?: number
  limit?: number
  sortBy?: 'date' | 'amount' | 'createdAt'
  sortOrder?: 'asc' | 'desc'
}

interface CreateTransactionData {
  description: string
  fromAccountId: string
  toAccountId: string
  amount: number
  currency?: string
  exchangeRate?: number
  date: string
}

interface UpdateTransactionData {
  description?: string
  fromAccountId?: string
  toAccountId?: string
  amount?: number
  currency?: string
  exchangeRate?: number
  date?: string
}

/**
 * Fetch transactions with optional filters and pagination
 */
export function useTransactions(filters?: TransactionFilters) {
  const queryKey = ['transactions', filters]

  return useQuery<PaginatedResponse<TTransaction>>({
    queryKey,
    queryFn: async () => {
      const params = new URLSearchParams()
      
      if (filters?.dateFrom) params.append('dateFrom', filters.dateFrom)
      if (filters?.dateTo) params.append('dateTo', filters.dateTo)
      if (filters?.fromAccountIds?.length) {
        filters.fromAccountIds.forEach(id => params.append('fromAccountIds', id))
      }
      if (filters?.toAccountIds?.length) {
        filters.toAccountIds.forEach(id => params.append('toAccountIds', id))
      }
      if (filters?.minAmount !== undefined) params.append('minAmount', filters.minAmount.toString())
      if (filters?.maxAmount !== undefined) params.append('maxAmount', filters.maxAmount.toString())
      if (filters?.type) params.append('type', filters.type)
      if (filters?.search) params.append('search', filters.search)
      if (filters?.page !== undefined) params.append('page', filters.page.toString())
      if (filters?.limit !== undefined) params.append('limit', filters.limit.toString())
      if (filters?.sortBy) params.append('sortBy', filters.sortBy)
      if (filters?.sortOrder) params.append('sortOrder', filters.sortOrder)

      const response = await fetch(`/api/transactions?${params.toString()}`)
      if (!response.ok) {
        throw new Error('Failed to fetch transactions')
      }
      const data = await response.json()
      return data.data
    },
  })
}

/**
 * Create a new transaction
 */
export function useCreateTransaction() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: CreateTransactionData) => {
      const response = await fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to create transaction')
      }

      return response.json()
    },
    onSuccess: () => {
      // Invalidate all transaction queries
      queryClient.invalidateQueries({ queryKey: ['transactions'] })
      // Invalidate entity queries since balances changed
      queryClient.invalidateQueries({ queryKey: ['assets'] })
      queryClient.invalidateQueries({ queryKey: ['goals'] })
      queryClient.invalidateQueries({ queryKey: ['loans'] })
      queryClient.invalidateQueries({ queryKey: ['credit-cards'] })
      queryClient.invalidateQueries({ queryKey: ['income-sources'] })
      queryClient.invalidateQueries({ queryKey: ['expense-categories'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
    },
  })
}

/**
 * Update a transaction
 */
export function useUpdateTransaction() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateTransactionData }) => {
      const response = await fetch(`/api/transactions/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to update transaction')
      }

      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] })
      queryClient.invalidateQueries({ queryKey: ['assets'] })
      queryClient.invalidateQueries({ queryKey: ['goals'] })
      queryClient.invalidateQueries({ queryKey: ['loans'] })
      queryClient.invalidateQueries({ queryKey: ['credit-cards'] })
      queryClient.invalidateQueries({ queryKey: ['income-sources'] })
      queryClient.invalidateQueries({ queryKey: ['expense-categories'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
    },
  })
}

/**
 * Delete a transaction
 */
export function useDeleteTransaction() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/transactions/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to delete transaction')
      }

      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] })
      queryClient.invalidateQueries({ queryKey: ['assets'] })
      queryClient.invalidateQueries({ queryKey: ['goals'] })
      queryClient.invalidateQueries({ queryKey: ['loans'] })
      queryClient.invalidateQueries({ queryKey: ['credit-cards'] })
      queryClient.invalidateQueries({ queryKey: ['income-sources'] })
      queryClient.invalidateQueries({ queryKey: ['expense-categories'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
    },
  })
}

