/**
 * Generic CRUD Hooks Factory
 * Creates standard query and mutation hooks for any resource
 */
import { useMutation, useQuery, useQueryClient, UseQueryResult, UseMutationResult } from '@tanstack/react-query'

interface CrudConfig {
  endpoint: string
  queryKey: string
  resourceName: string
}

/**
 * Factory function that generates CRUD hooks for a resource
 * Eliminates ~100 lines of boilerplate per resource
 */
export function createCrudHooks<T, TCreate = Partial<T>, TUpdate = Partial<T>>(config: CrudConfig) {
  const { endpoint, queryKey, resourceName } = config

  /**
   * Fetch all items
   */
  function useItems(): UseQueryResult<T[], Error> {
    return useQuery<T[]>({
      queryKey: [queryKey],
      queryFn: async () => {
        const response = await fetch(endpoint)
        if (!response.ok) {
          throw new Error(`Failed to fetch ${resourceName}s`)
        }
        const data = await response.json()
        return data.data
      },
    })
  }

  /**
   * Create a new item
   */
  function useCreateItem(): UseMutationResult<T, Error, TCreate> {
    const queryClient = useQueryClient()

    return useMutation({
      mutationFn: async (data: TCreate) => {
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        })

        if (!response.ok) {
          const error = await response.json()
          throw new Error(error.message || `Failed to create ${resourceName}`)
        }

        return response.json()
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: [queryKey] })
        queryClient.invalidateQueries({ queryKey: ['accounts'] })
        queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      },
    })
  }

  /**
   * Update an existing item
   */
  function useUpdateItem(): UseMutationResult<T, Error, { id: string; data: TUpdate }> {
    const queryClient = useQueryClient()

    return useMutation({
      mutationFn: async ({ id, data }: { id: string; data: TUpdate }) => {
        const response = await fetch(`${endpoint}/${id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        })

        if (!response.ok) {
          const error = await response.json()
          throw new Error(error.message || `Failed to update ${resourceName}`)
        }

        return response.json()
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: [queryKey] })
        queryClient.invalidateQueries({ queryKey: ['accounts'] })
        queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      },
    })
  }

  /**
   * Delete an item
   */
  function useDeleteItem(): UseMutationResult<void, Error, string> {
    const queryClient = useQueryClient()

    return useMutation({
      mutationFn: async (id: string) => {
        const response = await fetch(`${endpoint}/${id}`, {
          method: 'DELETE',
        })

        if (!response.ok) {
          const error = await response.json()
          throw new Error(error.message || `Failed to delete ${resourceName}`)
        }

        return response.json()
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: [queryKey] })
        queryClient.invalidateQueries({ queryKey: ['accounts'] })
        queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      },
    })
  }

  return {
    useItems,
    useCreateItem,
    useUpdateItem,
    useDeleteItem,
  }
}

