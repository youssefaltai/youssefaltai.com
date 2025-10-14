'use client'

import { useState } from 'react'
import { Eye, EyeOff, RotateCcw } from 'lucide-react'
import { Switch, Text, Stack, Group, Button } from '@mantine/core'
import { useWidgetPreferences, useUpdateWidgetPreferences } from '../../hooks/use-widget-preferences'

interface WidgetSettingsProps {
  onClose: () => void
}

const WIDGET_LABELS: Record<string, string> = {
  'net-worth': 'Total Net Worth',
  'alerts': 'Alerts',
  'financial-health': 'Financial Health Score',
  'spending-trends': 'Spending Trends Chart',
  'category-breakdown': 'Top Expense Categories',
  'month-comparison': 'Month Comparison',
  'quick-stats': 'Quick Stats',
  'goals': 'Active Goals',
  'account-balances': 'Account Balances',
  'insights': 'Insights & Tips',
  'recent-transactions': 'Recent Transactions',
}

/**
 * Widget settings panel
 * Allows users to show/hide dashboard widgets
 */
export function WidgetSettings({ onClose }: WidgetSettingsProps) {
  const { data: preferences } = useWidgetPreferences()
  const updatePreferences = useUpdateWidgetPreferences()
  const [localPreferences, setLocalPreferences] = useState<Record<string, boolean>>({})

  // Initialize local state when preferences load
  if (preferences && Object.keys(localPreferences).length === 0) {
    const prefs: Record<string, boolean> = {}
    preferences.forEach((pref) => {
      prefs[pref.widgetId] = pref.visible
    })
    setLocalPreferences(prefs)
  }

  const toggleWidget = (widgetId: string) => {
    setLocalPreferences((prev) => ({
      ...prev,
      [widgetId]: !prev[widgetId],
    }))
  }

  const handleSave = async () => {
    if (!preferences) return

    const updated = preferences.map((pref) => ({
      widgetId: pref.widgetId,
      visible: localPreferences[pref.widgetId] ?? pref.visible,
      order: pref.order,
    }))

    await updatePreferences.mutateAsync(updated)
    onClose()
  }

  const handleReset = () => {
    if (!preferences) return

    const defaults: Record<string, boolean> = {}
    preferences.forEach((pref) => {
      defaults[pref.widgetId] = true
    })
    setLocalPreferences(defaults)
  }

  return (
    <Stack gap="lg">
      <Text c="dimmed">
        Choose which widgets to display on your dashboard
      </Text>

      {/* Widget list */}
      <Stack gap="xs">
        {preferences?.map((pref) => (
          <Group
            key={pref.widgetId}
            p="md"
            justify="space-between"
            style={{ backgroundColor: 'var(--mantine-color-gray-0)', borderRadius: 'var(--mantine-radius-md)' }}
          >
            <Group gap="sm">
              {localPreferences[pref.widgetId] !== false ? (
                <Eye size={20} color="var(--mantine-color-blue-6)" />
              ) : (
                <EyeOff size={20} style={{ opacity: 0.5 }} />
              )}
              <Text>
                {WIDGET_LABELS[pref.widgetId] || pref.widgetId}
              </Text>
            </Group>

            <Switch
              checked={localPreferences[pref.widgetId] !== false}
              onChange={() => toggleWidget(pref.widgetId)}
            />
          </Group>
        ))}
      </Stack>

      {/* Actions */}
      <Group grow>
        <Button
          onClick={handleReset}
          variant="default"
          leftSection={<RotateCcw size={16} />}
        >
          Reset to Default
        </Button>
        <Button
          onClick={handleSave}
          loading={updatePreferences.isPending}
        >
          Save Changes
        </Button>
      </Group>
    </Stack>
  )
}

