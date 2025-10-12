/**
 * Credit Card CRUD hooks
 * Generated using createCrudHooks factory
 */
import type { Account } from '@repo/db'
import { createCrudHooks } from './create-crud-hooks'

const { useItems, useCreateItem, useUpdateItem, useDeleteItem } = createCrudHooks<Account>({
  endpoint: '/api/credit-cards',
  queryKey: 'credit-cards',
  resourceName: 'credit card',
})

export const useCreditCards = useItems
export const useCreateCreditCard = useCreateItem
export const useUpdateCreditCard = useUpdateItem
export const useDeleteCreditCard = useDeleteItem

