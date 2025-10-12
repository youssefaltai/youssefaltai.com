/**
 * Loan CRUD hooks
 * Generated using createCrudHooks factory
 */
import type { Account } from '@repo/db'
import { createCrudHooks } from './create-crud-hooks'

const { useItems, useCreateItem, useUpdateItem, useDeleteItem } = createCrudHooks<Account>({
  endpoint: '/api/loans',
  queryKey: 'loans',
  resourceName: 'loan',
})

export const useLoans = useItems
export const useCreateLoan = useCreateItem
export const useUpdateLoan = useUpdateItem
export const useDeleteLoan = useDeleteItem

