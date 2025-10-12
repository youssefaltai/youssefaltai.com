/**
 * Budget CRUD hooks
 * Generated using createCrudHooks factory
 */
import { createCrudHooks } from './create-crud-hooks'

// Budget type from Prisma with accounts relation
interface Budget {
  id: string
  name: string
  amount: string
  currency: string
  startDate: string
  endDate: string
  createdAt: string
  accounts: Array<{
    budgetId: string
    accountId: string
    account: {
      id: string
      name: string
      type: string
      currency: string
    }
  }>
}

const { useItems, useCreateItem, useUpdateItem, useDeleteItem } = createCrudHooks<Budget>({
  endpoint: '/api/budgets',
  queryKey: 'budgets',
  resourceName: 'budget',
})

export const useBudgets = useItems
export const useCreateBudget = useCreateItem
export const useUpdateBudget = useUpdateItem
export const useDeleteBudget = useDeleteItem

