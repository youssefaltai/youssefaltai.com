'use client'

import { EmptyState } from './EmptyState'
import { GroupedList } from './GroupedList'
import type { LucideIcon } from 'lucide-react'

interface EntityListProps<T = any> {
  items: T[]
  emptyIcon: LucideIcon
  emptyTitle: string
  emptyDescription: string
  renderItem: (item: T, index: number) => React.ReactNode
}

/**
 * Standard entity list with empty state
 * Ensures consistent spacing and structure
 */
export function EntityList<T = any>({
  items,
  emptyIcon,
  emptyTitle,
  emptyDescription,
  renderItem,
}: EntityListProps<T>) {
  if (items.length === 0) {
    return (
      <div className="pt-16">
        <EmptyState
          icon={emptyIcon}
          title={emptyTitle}
          description={emptyDescription}
        />
      </div>
    )
  }

  return (
    <GroupedList>
      {items.map((item, index) => renderItem(item, index))}
    </GroupedList>
  )
}

