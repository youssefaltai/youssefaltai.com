'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { WidgetPreference } from '../app/api/user/widget-preferences/route'

/**
 * Fetch user's widget preferences
 */
export function useWidgetPreferences() {
  return useQuery<WidgetPreference[]>({
    queryKey: ['widget-preferences'],
    queryFn: async () => {
      const response = await fetch('/api/user/widget-preferences')

      if (!response.ok) {
        throw new Error('Failed to fetch widget preferences')
      }

      const { data } = await response.json()
      return data
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  })
}

/**
 * Update widget preferences
 * Uses optimistic updates for instant UI feedback
 */
export function useUpdateWidgetPreferences() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (preferences: Omit<WidgetPreference, 'id'>[]) => {
      const response = await fetch('/api/user/widget-preferences', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(preferences),
      })

      if (!response.ok) {
        throw new Error('Failed to update widget preferences')
      }

      const { data } = await response.json()
      return data
    },
    onMutate: async (newPreferences) => {
      // Cancel outgoing queries
      await queryClient.cancelQueries({ queryKey: ['widget-preferences'] })

      // Snapshot current value
      const previousPreferences = queryClient.getQueryData<WidgetPreference[]>(['widget-preferences'])

      // Optimistically update
      queryClient.setQueryData<WidgetPreference[]>(['widget-preferences'], (old) => {
        if (!old) return old

        // Update existing preferences
        return old.map((pref) => {
          const update = newPreferences.find((p) => p.widgetId === pref.widgetId)
          return update ? { ...pref, ...update } : pref
        })
      })

      return { previousPreferences }
    },
    onError: (_err, _newPreferences, context) => {
      // Rollback on error
      if (context?.previousPreferences) {
        queryClient.setQueryData(['widget-preferences'], context.previousPreferences)
      }
    },
    onSettled: () => {
      // Refetch to ensure consistency
      queryClient.invalidateQueries({ queryKey: ['widget-preferences'] })
    },
  })
}

/**
 * Check if a specific widget is visible
 */
export function useIsWidgetVisible(widgetId: string): boolean {
  const { data: preferences } = useWidgetPreferences()

  if (!preferences) return true // Default to visible

  const pref = preferences.find((p) => p.widgetId === widgetId)
  return pref ? pref.visible : true
}

/**
 * Toggle a widget's visibility
 */
export function useToggleWidget(widgetId: string) {
  const queryClient = useQueryClient()
  const updatePreferences = useUpdateWidgetPreferences()

  return useMutation({
    mutationFn: async (visible: boolean) => {
      const currentPreferences = queryClient.getQueryData<WidgetPreference[]>(['widget-preferences']) || []

      const updatedPreferences = currentPreferences.map((pref) => ({
        widgetId: pref.widgetId,
        visible: pref.widgetId === widgetId ? visible : pref.visible,
        order: pref.order,
      }))

      await updatePreferences.mutateAsync(updatedPreferences)
    },
  })
}

