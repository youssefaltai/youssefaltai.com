import { type LucideIcon } from 'lucide-react'
import { Card } from './Card'

interface EmptyStateProps {
  icon: LucideIcon
  title: string
  description: string
}

/**
 * Empty state component with icon, title, and description
 * Follows Apple HIG for empty content states
 */
export function EmptyState({ icon: Icon, title, description }: EmptyStateProps) {
  return (
    <Card className="text-center py-12">
      <Icon className="w-16 h-16 mx-auto text-ios-gray-3 mb-4" strokeWidth={1.5} />
      <p className="text-ios-body font-medium text-ios-gray-1">{title}</p>
      <p className="text-ios-footnote text-ios-gray-2 mt-1">{description}</p>
    </Card>
  )
}

