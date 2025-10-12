'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { Account } from '@repo/db'

type Loan = Account

interface CreateLoanData {
  name: string
  description?: string
  currency: string
  dueDate?: string
  openingBalance?: number
  openingBalanceExchangeRate?: number
}

interface UpdateLoanData {
  name?: string
  description?: string
  currency?: string
}

/**
 * Fetch all loans for the current user
 */
export function useLoans() {
  return useQuery<Loan[]>({
    queryKey: ['loans'],
    queryFn: async () => {
      const response = await fetch('/api/loans')
      if (!response.ok) {
        throw new Error('Failed to fetch loans')
      }
      const data = await response.json()
      return data.data
    },
  })
}

/**
 * Create a new loan
 */
export function useCreateLoan() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: CreateLoanData) => {
      const response = await fetch('/api/loans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to create loan')
      }

      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['loans'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
    },
  })
}

/**
 * Update a loan
 */
export function useUpdateLoan() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateLoanData }) => {
      const response = await fetch(`/api/loans/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to update loan')
      }

      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['loans'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
    },
  })
}

/**
 * Delete a loan
 */
export function useDeleteLoan() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/loans/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to delete loan')
      }

      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['loans'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
    },
  })
}

