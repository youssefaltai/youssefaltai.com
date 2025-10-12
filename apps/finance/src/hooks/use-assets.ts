/**
 * Asset CRUD hooks
 * Generated using createCrudHooks factory
 */
import type { Account } from '@repo/db'
import { createCrudHooks } from './create-crud-hooks'

const { useItems, useCreateItem, useUpdateItem, useDeleteItem } = createCrudHooks<Account>({
  endpoint: '/api/assets',
  queryKey: 'assets',
  resourceName: 'asset',
})

export const useAssets = useItems
export const useCreateAsset = useCreateItem
export const useUpdateAsset = useUpdateItem
export const useDeleteAsset = useDeleteItem

