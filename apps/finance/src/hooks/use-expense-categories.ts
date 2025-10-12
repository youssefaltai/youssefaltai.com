/**
 * Expense Category CRUD hooks
 * Generated using createCrudHooks factory
 */
import type { Account } from '@repo/db'
import { createCrudHooks } from './create-crud-hooks'

const { useItems, useCreateItem, useUpdateItem, useDeleteItem } = createCrudHooks<Account>({
  endpoint: '/api/expense',
  queryKey: 'expense-categories',
  resourceName: 'expense category',
})

export const useExpenseCategories = useItems
export const useCreateExpenseCategory = useCreateItem
export const useUpdateExpenseCategory = useUpdateItem
export const useDeleteExpenseCategory = useDeleteItem

