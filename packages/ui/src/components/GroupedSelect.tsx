'use client'

import { cn } from '@repo/utils'

export interface GroupedSelectOption {
  value: string
  label: string
  metadata?: string
}

export interface GroupedSelectGroup {
  label: string
  options: GroupedSelectOption[]
}

interface GroupedSelectProps {
  value: string
  onChange: (value: string) => void
  groups: GroupedSelectGroup[]
  label?: string
  placeholder?: string
  error?: string
  disabled?: boolean
  className?: string
}

/**
 * Generic grouped select component with optgroup support
 * Displays options organized by groups
 * Supports optional metadata display (e.g., balance, count, etc.)
 */
export function GroupedSelect({
  value,
  onChange,
  groups,
  label,
  placeholder = 'Select...',
  error,
  disabled,
  className,
}: GroupedSelectProps) {
  return (
    <div className={cn('space-y-1', className)}>
      {label && (
        <label className="block text-ios-footnote text-ios-gray-1 font-medium">
          {label}
        </label>
      )}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className={cn(
          'w-full h-11 px-4 bg-ios-gray-6 rounded-ios text-ios-body text-ios-label-primary',
          'focus:outline-none focus:ring-2 focus:ring-ios-blue focus:bg-white',
          'transition-all appearance-none cursor-pointer',
          'disabled:opacity-40 disabled:cursor-not-allowed',
          error && 'ring-2 ring-ios-red focus:ring-ios-red'
        )}
      >
        <option value="" disabled>
          {placeholder}
        </option>

        {groups.map((group) => (
          <optgroup key={group.label} label={group.label}>
            {group.options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
                {option.metadata ? ` (${option.metadata})` : ''}
              </option>
            ))}
          </optgroup>
        ))}
      </select>
      {error && (
        <p className="text-ios-footnote text-ios-red">{error}</p>
      )}
    </div>
  )
}

