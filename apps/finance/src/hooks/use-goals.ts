/**
 * Goal CRUD hooks
 * Generated using createCrudHooks factory
 */
import type { Account } from '@repo/db'
import { createCrudHooks } from './create-crud-hooks'

const { useItems, useCreateItem, useUpdateItem, useDeleteItem } = createCrudHooks<Account>({
  endpoint: '/api/goals',
  queryKey: 'goals',
  resourceName: 'goal',
})

export const useGoals = useItems
export const useCreateGoal = useCreateItem
export const useUpdateGoal = useUpdateItem
export const useDeleteGoal = useDeleteItem

