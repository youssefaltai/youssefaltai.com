'use client'

import { cn } from '@repo/utils'

export interface Tab {
  id: string
  label: string
}

interface TabsProps {
  tabs: Tab[]
  activeTab: string
  onTabChange: (tabId: string) => void
  className?: string
}

/**
 * iOS-style segmented control tabs
 */
export function Tabs({ tabs, activeTab, onTabChange, className }: TabsProps) {
  return (
    <div
      className={cn(
        'inline-flex bg-ios-gray-6 rounded-ios p-1 gap-1',
        className
      )}
    >
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={cn(
            'px-4 py-2 rounded-ios text-ios-callout font-medium transition-all',
            activeTab === tab.id
              ? 'bg-white text-ios-label-primary shadow-ios-sm'
              : 'text-ios-gray-1 hover:text-ios-label-primary'
          )}
        >
          {tab.label}
        </button>
      ))}
    </div>
  )
}

