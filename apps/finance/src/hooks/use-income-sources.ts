/**
 * Income Source CRUD hooks
 * Generated using createCrudHooks factory
 */
import type { Account } from '@repo/db'
import { createCrudHooks } from './create-crud-hooks'

const { useItems, useCreateItem, useUpdateItem, useDeleteItem } = createCrudHooks<Account>({
  endpoint: '/api/income',
  queryKey: 'income-sources',
  resourceName: 'income source',
})

export const useIncomeSources = useItems
export const useCreateIncomeSource = useCreateItem
export const useUpdateIncomeSource = useUpdateItem
export const useDeleteIncomeSource = useDeleteItem

