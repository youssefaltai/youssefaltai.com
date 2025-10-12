'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { Account } from '@repo/db'

type CreditCard = Account

interface CreateCreditCardData {
  name: string
  description?: string
  currency: string
  openingBalance?: number
  openingBalanceExchangeRate?: number
}

interface UpdateCreditCardData {
  name?: string
  description?: string
  currency?: string
}

/**
 * Fetch all credit cards for the current user
 */
export function useCreditCards() {
  return useQuery<CreditCard[]>({
    queryKey: ['credit-cards'],
    queryFn: async () => {
      const response = await fetch('/api/credit-cards')
      if (!response.ok) {
        throw new Error('Failed to fetch credit cards')
      }
      const data = await response.json()
      return data.data
    },
  })
}

/**
 * Create a new credit card
 */
export function useCreateCreditCard() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: CreateCreditCardData) => {
      const response = await fetch('/api/credit-cards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to create credit card')
      }

      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['credit-cards'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
    },
  })
}

/**
 * Update a credit card
 */
export function useUpdateCreditCard() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateCreditCardData }) => {
      const response = await fetch(`/api/credit-cards/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to update credit card')
      }

      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['credit-cards'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
    },
  })
}

/**
 * Delete a credit card
 */
export function useDeleteCreditCard() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/credit-cards/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to delete credit card')
      }

      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['credit-cards'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
    },
  })
}

