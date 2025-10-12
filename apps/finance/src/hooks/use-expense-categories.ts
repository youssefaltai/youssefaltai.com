'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { Account } from '@repo/db'

type ExpenseCategory = Account

interface CreateExpenseCategoryData {
  name: string
  description?: string
  currency: string
  openingBalance?: number
  openingBalanceExchangeRate?: number
}

interface UpdateExpenseCategoryData {
  name?: string
  description?: string
  currency?: string
}

/**
 * Fetch all expense categories for the current user
 */
export function useExpenseCategories() {
  return useQuery<ExpenseCategory[]>({
    queryKey: ['expense-categories'],
    queryFn: async () => {
      const response = await fetch('/api/expense')
      if (!response.ok) {
        throw new Error('Failed to fetch expense categories')
      }
      const data = await response.json()
      return data.data
    },
  })
}

/**
 * Create a new expense category
 */
export function useCreateExpenseCategory() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: CreateExpenseCategoryData) => {
      const response = await fetch('/api/expense', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to create expense category')
      }

      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expense-categories'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
    },
  })
}

/**
 * Update an expense category
 */
export function useUpdateExpenseCategory() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateExpenseCategoryData }) => {
      const response = await fetch(`/api/expense/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to update expense category')
      }

      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expense-categories'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
    },
  })
}

/**
 * Delete an expense category
 */
export function useDeleteExpenseCategory() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/expense/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to delete expense category')
      }

      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expense-categories'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
    },
  })
}

