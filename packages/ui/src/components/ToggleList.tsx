'use client'

import { Switch } from './Switch'
import type { LucideIcon } from 'lucide-react'

export interface ToggleListItem {
  id: string
  label: string
  checked: boolean
  icon?: LucideIcon
}

interface ToggleListProps {
  items: ToggleListItem[]
  onToggle: (id: string) => void
}

/**
 * Generic toggleable list component
 * Reusable for any settings/preferences UI
 */
export function ToggleList({ items, onToggle }: ToggleListProps) {
  return (
    <div className="space-y-2">
      {items.map((item) => {
        const Icon = item.icon
        return (
          <div
            key={item.id}
            className="w-full flex items-center justify-between p-3 bg-ios-gray-6 rounded-ios"
          >
            <div className="flex items-center gap-3">
              {Icon && <Icon className="w-5 h-5 text-ios-gray-2" />}
              <span className="text-ios-body text-ios-label-primary">
                {item.label}
              </span>
            </div>

            <Switch
              checked={item.checked}
              onChange={() => onToggle(item.id)}
            />
          </div>
        )
      })}
    </div>
  )
}

