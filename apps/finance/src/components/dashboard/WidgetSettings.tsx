'use client'

import { useWidgetPreferences, useUpdateWidgetPreferences } from '../../hooks/use-widget-preferences'
import { useState } from 'react'
import { Eye, EyeOff, RotateCcw, Switch } from '@repo/ui'

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
    <div>
      <p className="text-ios-body text-ios-gray-1 mb-4">
        Choose which widgets to display on your dashboard
      </p>

      {/* Widget list */}
      <div className="space-y-2 mb-6">
        {preferences?.map((pref) => (
          <div
            key={pref.widgetId}
            className="w-full flex items-center justify-between p-3 bg-ios-gray-6 rounded-ios"
          >
            <div className="flex items-center gap-3">
              {localPreferences[pref.widgetId] !== false ? (
                <Eye className="w-5 h-5 text-ios-blue" />
              ) : (
                <EyeOff className="w-5 h-5 text-ios-gray-2" />
              )}
              <span className="text-ios-body text-ios-label-primary">
                {WIDGET_LABELS[pref.widgetId] || pref.widgetId}
              </span>
            </div>

            <Switch
              checked={localPreferences[pref.widgetId] !== false}
              onChange={() => toggleWidget(pref.widgetId)}
            />
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button
          onClick={handleReset}
          className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-ios-gray-6 hover:bg-ios-gray-5 text-ios-label-primary rounded-ios font-medium transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
          Reset to Default
        </button>
        <button
          onClick={handleSave}
          disabled={updatePreferences.isPending}
          className="flex-1 py-3 px-4 bg-ios-blue hover:bg-blue-600 text-white rounded-ios font-medium transition-colors disabled:opacity-50"
        >
          {updatePreferences.isPending ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </div>
  )
}

