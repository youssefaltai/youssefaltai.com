'use client'

import { cn } from '@repo/utils'
import type { LucideIcon } from 'lucide-react'

export interface ActionGridAction {
  icon: LucideIcon
  label: string
  onClick: () => void
  color?: 'blue' | 'neutral'
}

interface ActionGridProps {
  actions: ActionGridAction[]
  title?: string
  columns?: 2 | 3 | 4
}

/**
 * Generic action button grid component
 * Displays actions in a responsive grid layout
 * Supports 2, 3, or 4 column layouts
 */
export function ActionGrid({ actions, title, columns = 2 }: ActionGridProps) {
  const colorClasses = {
    blue: 'bg-ios-blue/10 text-ios-blue',
    neutral: 'bg-ios-gray-6 text-ios-gray-1',
  }

  const gridClasses = {
    2: 'grid-cols-2',
    3: 'grid-cols-3',
    4: 'grid-cols-2 sm:grid-cols-4',
  }

  return (
    <div className="space-y-3">
      {title && (
        <h2 className="text-ios-title-3 font-semibold text-ios-label-primary px-2">
          {title}
        </h2>
      )}
      
      <div className={cn('grid gap-3', gridClasses[columns])}>
        {actions.map((action, index) => {
          const Icon = action.icon
          return (
            <button
              key={index}
              onClick={action.onClick}
              className="flex flex-col items-center gap-2 p-4 rounded-ios bg-white border border-ios-gray-5 hover:bg-ios-gray-6 active:bg-ios-gray-5 transition-colors shadow-ios-sm"
            >
              <div
                className={cn(
                  'w-12 h-12 rounded-full flex items-center justify-center',
                  colorClasses[action.color || 'neutral']
                )}
              >
                <Icon className="w-6 h-6" />
              </div>
              <span className="text-ios-callout text-ios-label-primary font-medium text-center">
                {action.label}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

