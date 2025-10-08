/**
 * Input Component
 * Follows Apple's form design guidelines
 */
import { cn } from '@repo/utils'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  helperText?: string
}

export function Input({
  label,
  error,
  helperText,
  className,
  ...props
}: InputProps) {
  return (
    <div className="space-y-1">
      {label && (
        <label className="block text-ios-footnote text-ios-gray-1 font-medium">
          {label}
        </label>
      )}
      <input
        className={cn(
          // Base styles
          'w-full min-h-[44px]',
          'px-4 py-3',
          'bg-ios-gray-6',
          'border border-ios-gray-3',
          'rounded-ios-sm',
          'text-ios-body text-ios-label-primary',
          'placeholder:text-ios-gray-2',
          // Focus state
          'focus:outline-none focus:ring-2 focus:ring-ios-blue focus:border-transparent',
          // Error state
          error && 'border-ios-red focus:ring-ios-red',
          // Disabled state
          'disabled:opacity-40 disabled:cursor-not-allowed',
          className
        )}
        {...props}
      />
      {error && (
        <p className="text-ios-footnote text-ios-red">{error}</p>
      )}
      {helperText && !error && (
        <p className="text-ios-footnote text-ios-gray-1">{helperText}</p>
      )}
    </div>
  )
}

/**
 * Textarea Component
 */
interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
}

export function Textarea({
  label,
  error,
  className,
  ...props
}: TextareaProps) {
  return (
    <div className="space-y-1">
      {label && (
        <label className="block text-ios-footnote text-ios-gray-1 font-medium">
          {label}
        </label>
      )}
      <textarea
        className={cn(
          'w-full min-h-[88px]',
          'px-4 py-3',
          'bg-ios-gray-6',
          'border border-ios-gray-3',
          'rounded-ios-sm',
          'text-ios-body text-ios-label-primary',
          'placeholder:text-ios-gray-2',
          'focus:outline-none focus:ring-2 focus:ring-ios-blue focus:border-transparent',
          'resize-none',
          error && 'border-ios-red focus:ring-ios-red',
          'disabled:opacity-40 disabled:cursor-not-allowed',
          className
        )}
        {...props}
      />
      {error && (
        <p className="text-ios-footnote text-ios-red">{error}</p>
      )}
    </div>
  )
}

/**
 * Select Component
 */
interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
  options: Array<{ value: string; label: string }>
}

export function Select({
  label,
  error,
  options,
  className,
  ...props
}: SelectProps) {
  return (
    <div className="space-y-1">
      {label && (
        <label className="block text-ios-footnote text-ios-gray-1 font-medium">
          {label}
        </label>
      )}
      <select
        className={cn(
          'w-full min-h-[44px]',
          'px-4 py-3',
          'bg-ios-gray-6',
          'border border-ios-gray-3',
          'rounded-ios-sm',
          'text-ios-body text-ios-label-primary',
          'focus:outline-none focus:ring-2 focus:ring-ios-blue focus:border-transparent',
          error && 'border-ios-red focus:ring-ios-red',
          'disabled:opacity-40 disabled:cursor-not-allowed',
          className
        )}
        {...props}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && (
        <p className="text-ios-footnote text-ios-red">{error}</p>
      )}
    </div>
  )
}
