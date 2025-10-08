/**
 * Card Component
 * Grouped list style with subtle borders and shadows
 */
import { cn } from '@repo/utils'

interface CardProps {
  children: React.ReactNode
  className?: string
  padding?: 'none' | 'sm' | 'md' | 'lg'
}

export function Card({ children, className, padding = 'md' }: CardProps) {
  const paddingClasses = {
    none: '',
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6',
  }

  return (
    <div
      className={cn(
        'bg-white rounded-ios',
        'border border-ios-gray-5',
        'shadow-ios-sm',
        paddingClasses[padding],
        className
      )}
    >
      {children}
    </div>
  )
}

/**
 * Card with sections (grouped list)
 */
interface CardSectionProps {
  title?: string
  children: React.ReactNode
}

export function CardSection({ title, children }: CardSectionProps) {
  return (
    <div className="space-y-2">
      {title && (
        <h3 className="text-ios-footnote text-ios-gray-1 uppercase tracking-wide px-4 mb-2">
          {title}
        </h3>
      )}
      <Card padding="none">{children}</Card>
    </div>
  )
}

/**
 * List Item for grouped lists
 */
interface ListItemProps {
  label: string
  value?: string | React.ReactNode
  onClick?: () => void
  chevron?: boolean
}

export function ListItem({ label, value, onClick, chevron = false }: ListItemProps) {
  const isClickable = onClick !== undefined || chevron

  return (
    <button
      onClick={onClick}
      disabled={!isClickable}
      className={cn(
        'w-full flex items-center justify-between',
        'px-4 py-3',
        'border-b border-ios-gray-5 last:border-b-0',
        'text-left',
        isClickable && 'hover:bg-ios-gray-6 active:bg-ios-gray-5 transition-colors',
        !isClickable && 'cursor-default'
      )}
    >
      <span className="text-ios-body text-ios-label-primary">{label}</span>
      <div className="flex items-center gap-2">
        {value && (
          <span className="text-ios-body text-ios-gray-1">{value}</span>
        )}
        {chevron && (
          <svg className="w-4 h-4 text-ios-gray-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        )}
      </div>
    </button>
  )
}
