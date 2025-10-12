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
          // Base styles - iOS-style input
          'w-full h-11',
          'px-4',
          'bg-ios-gray-6',
          'rounded-ios',
          'text-ios-body text-ios-label-primary',
          'placeholder:text-ios-gray-2',
          // Focus state - transitions to white
          'focus:outline-none focus:ring-2 focus:ring-ios-blue focus:bg-white',
          // Error state
          error && 'ring-2 ring-ios-red focus:ring-ios-red',
          // Disabled state
          'disabled:opacity-40 disabled:cursor-not-allowed',
          // Smooth transitions
          'transition-all',
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
          // Base styles - iOS-style textarea
          'w-full min-h-[88px]',
          'px-4 py-3',
          'bg-ios-gray-6',
          'rounded-ios',
          'text-ios-body text-ios-label-primary',
          'placeholder:text-ios-gray-2',
          // Focus state - transitions to white
          'focus:outline-none focus:ring-2 focus:ring-ios-blue focus:bg-white',
          // Resize
          'resize-none',
          // Error state
          error && 'ring-2 ring-ios-red focus:ring-ios-red',
          // Disabled state
          'disabled:opacity-40 disabled:cursor-not-allowed',
          // Smooth transitions
          'transition-all',
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
  children?: React.ReactNode
}

export function Select({
  label,
  error,
  className,
  children,
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
          // Base styles - iOS-style select
          'w-full h-11',
          'px-4',
          'bg-ios-gray-6',
          'rounded-ios',
          'text-ios-body text-ios-label-primary',
          // Focus state - transitions to white
          'focus:outline-none focus:ring-2 focus:ring-ios-blue focus:bg-white',
          // Error state
          error && 'ring-2 ring-ios-red focus:ring-ios-red',
          // Disabled state
          'disabled:opacity-40 disabled:cursor-not-allowed',
          // Smooth transitions
          'transition-all',
          className
        )}
        {...props}
      >
        {children}
      </select>
      {error && (
        <p className="text-ios-footnote text-ios-red">{error}</p>
      )}
    </div>
  )
}
