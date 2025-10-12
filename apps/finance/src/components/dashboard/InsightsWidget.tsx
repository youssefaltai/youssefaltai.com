'use client'

import { DashboardWidget } from './DashboardWidget'
import { useInsights } from '../../hooks/use-dashboard-insights'
import {
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Target,
  PiggyBank,
  Activity,
  Heart,
  Receipt,
} from '@repo/ui'
import { cn } from '@repo/utils'
import type { Insight } from '../../app/api/dashboard/insights/route'

/**
 * Insights widget
 * Shows AI-generated financial insights and tips
 */
export function InsightsWidget() {
  const { data: insights, isLoading, error } = useInsights()

  const getInsightIcon = (iconName: string) => {
    const iconClass = 'w-5 h-5'
    switch (iconName) {
      case 'TrendingUp':
        return <TrendingUp className={iconClass} />
      case 'TrendingDown':
        return <TrendingDown className={iconClass} />
      case 'AlertTriangle':
        return <AlertTriangle className={iconClass} />
      case 'Target':
        return <Target className={iconClass} />
      case 'PiggyBank':
        return <PiggyBank className={iconClass} />
      case 'Activity':
        return <Activity className={iconClass} />
      case 'Heart':
        return <Heart className={iconClass} />
      case 'Receipt':
        return <Receipt className={iconClass} />
      default:
        return <Activity className={iconClass} />
    }
  }

  const getInsightColor = (type: Insight['type']) => {
    switch (type) {
      case 'positive':
        return 'text-ios-green'
      case 'warning':
        return 'text-ios-orange'
      case 'info':
      default:
        return 'text-ios-blue'
    }
  }

  const getInsightBg = (type: Insight['type']) => {
    switch (type) {
      case 'positive':
        return 'bg-green-50'
      case 'warning':
        return 'bg-orange-50'
      case 'info':
      default:
        return 'bg-blue-50'
    }
  }

  return (
    <DashboardWidget
      title="Insights"
      subtitle="Personalized financial tips"
      loading={isLoading}
      error={error instanceof Error ? error.message : null}
      isEmpty={insights.length === 0}
      emptyMessage="No insights available yet"
      emptyIcon={<Activity className="w-12 h-12" />}
    >
      <div className="space-y-3">
        {insights.map((insight) => (
          <div
            key={insight.id}
            className={cn('p-3 rounded-ios border border-transparent', getInsightBg(insight.type))}
          >
            <div className="flex items-start gap-3">
              <div className={cn('flex-shrink-0 mt-0.5', getInsightColor(insight.type))}>
                {getInsightIcon(insight.icon)}
              </div>
              <p className="text-ios-callout text-ios-label-primary flex-1">{insight.message}</p>
            </div>
          </div>
        ))}
      </div>
    </DashboardWidget>
  )
}

