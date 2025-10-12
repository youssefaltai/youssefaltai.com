'use client'

import { DashboardWidget } from './DashboardWidget'
import { useFinancialHealthScore } from '../../hooks/use-dashboard-insights'
import { Heart } from '@repo/ui'
import { cn } from '@repo/utils'

/**
 * Financial health widget
 * Shows a health score with visual indicator
 * All color/label/tips logic is determined by the backend
 */
export function FinancialHealthWidget() {
  const { data: healthData, isLoading, error } = useFinancialHealthScore()

  return (
    <DashboardWidget
      title="Financial Health"
      subtitle="Your overall financial health score"
      loading={isLoading}
      error={error instanceof Error ? error.message : null}
      isEmpty={false}
    >
      <div className="flex flex-col items-center">
        {/* Circular progress indicator */}
        <div className="relative w-40 h-40 mb-4">
          {/* Background circle */}
          <svg className="w-40 h-40 transform -rotate-90">
            <circle
              cx="80"
              cy="80"
              r="70"
              strokeWidth="12"
              fill="none"
              className="stroke-ios-gray-5"
            />
            {/* Progress circle */}
            <circle
              cx="80"
              cy="80"
              r="70"
              strokeWidth="12"
              fill="none"
              strokeLinecap="round"
              strokeDasharray={`${(healthData.score / 100) * 439.6} 439.6`}
              className={cn('transition-all duration-1000', healthData.color)}
            />
          </svg>

          {/* Score text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <p className={cn('text-5xl font-bold', healthData.color)}>
              {healthData.score}
            </p>
            <p className="text-ios-callout text-ios-gray-2">out of 100</p>
          </div>
        </div>

        {/* Status label */}
        <div className="flex items-center gap-2 mb-4">
          <Heart className={cn('w-5 h-5', healthData.color)} fill="currentColor" />
          <p className={cn('text-ios-title-3 font-semibold', healthData.color)}>
            {healthData.label}
          </p>
        </div>

        {/* Tips */}
        <div className="w-full bg-ios-gray-6 rounded-ios p-4">
          <p className="text-ios-caption font-semibold text-ios-gray-2 mb-2">Tips to improve:</p>
          <ul className="space-y-2">
            {healthData.tips.map((tip, index) => (
              <li key={index} className="flex items-start gap-2">
                <span className="text-ios-blue mt-0.5">•</span>
                <span className="text-ios-callout text-ios-label-primary flex-1">{tip}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </DashboardWidget>
  )
}

