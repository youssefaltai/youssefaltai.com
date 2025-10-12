'use client'

import { cn } from '@repo/utils'

export interface ChipSelectOption {
  id: string
  label: string
}

interface ChipSelectProps {
  options: ChipSelectOption[]
  selectedIds: string[]
  onToggle: (id: string) => void
  label?: string
  className?: string
  emptyMessage?: string
}

/**
 * Multi-select component with chip-based UI
 * Shows options as selectable chips with checkmark indicator
 */
export function ChipSelect({
  options,
  selectedIds,
  onToggle,
  label,
  className,
  emptyMessage = 'No options available',
}: ChipSelectProps) {
  if (options.length === 0) {
    return (
      <div className={className}>
        {label && (
          <label className="block text-ios-body font-medium text-ios-label-primary mb-2">
            {label}
          </label>
        )}
        <p className="text-ios-footnote text-ios-gray-1">{emptyMessage}</p>
      </div>
    )
  }

  return (
    <div className={className}>
      {label && (
        <label className="block text-ios-body font-medium text-ios-label-primary mb-2">
          {label}
        </label>
      )}
      <div className="flex flex-wrap gap-2">
        {options.map((option) => {
          const isSelected = selectedIds.includes(option.id)
          return (
            <button
              key={option.id}
              type="button"
              onClick={() => onToggle(option.id)}
              className={cn(
                'inline-flex items-center px-3 py-2 rounded-full',
                'text-ios-body font-medium transition-all duration-200',
                'active:scale-95',
                isSelected
                  ? 'bg-ios-blue text-white'
                  : 'bg-ios-gray-6 text-ios-label-primary hover:bg-ios-gray-5'
              )}
            >
              {option.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}

