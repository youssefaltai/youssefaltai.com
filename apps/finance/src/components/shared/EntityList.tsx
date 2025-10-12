'use client'

import { EmptyState } from '@repo/ui'
import { GroupedList } from './GroupedList'
import type { LucideIcon } from '@repo/ui'

interface EntityListProps {
  items: any[]
  emptyIcon: LucideIcon
  emptyTitle: string
  emptyDescription: string
  renderItem: (item: any, index: number) => React.ReactNode
}

/**
 * Standard entity list with empty state
 * Ensures consistent spacing and structure
 */
export function EntityList({
  items,
  emptyIcon,
  emptyTitle,
  emptyDescription,
  renderItem,
}: EntityListProps) {
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

