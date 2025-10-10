'use client'

import { type LucideIcon } from 'lucide-react'
import { cn } from '@repo/utils'

interface FloatingActionButtonProps {
  /**
   * Icon component to display
   */
  icon: LucideIcon
  /**
   * Click handler
   */
  onClick: () => void
  /**
   * Accessible label for screen readers
   */
  label: string
  /**
   * Optional additional classes
   */
  className?: string
}

/**
 * Floating Action Button (FAB)
 * 
 * iOS-style circular floating button for primary actions.
 * Positioned fixed at bottom center by default.
 * 
 * @example
 * ```tsx
 * import { Plus } from '@repo/ui'
 * 
 * <FloatingActionButton
 *   icon={Plus}
 *   onClick={handleAdd}
 *   label="Add transaction"
 * />
 * ```
 */
export function FloatingActionButton({
  icon: Icon,
  onClick,
  label,
  className,
}: FloatingActionButtonProps) {

  return (
    <button
      onClick={onClick}
      aria-label={label}
      className={cn(
        // Size & Shape
        'rounded-full',
        'p-4',
        'flex items-center justify-center',
        // Colors
        'bg-ios-blue hover:bg-ios-blue/90 text-white',
        // Effects
        'shadow-ios-lg',
        'transition-all duration-200 ease-out',
        'active:scale-95',
        // Custom overrides
        className
      )}
    >
      <Icon className="w-6 h-6" strokeWidth={2.5} />
    </button>
  )
}
