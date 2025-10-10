import { cn } from '@repo/utils'

interface SwitchProps {
  checked: boolean
  onChange: (checked: boolean) => void
  disabled?: boolean
  className?: string
}

/**
 * iOS-style toggle switch component
 * Follows Apple HIG for switches
 */
export function Switch({ checked, onChange, disabled = false, className }: SwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => !disabled && onChange(!checked)}
      className={cn(
        'w-12 h-7 rounded-full transition-colors relative',
        checked ? 'bg-ios-green' : 'bg-ios-gray-3',
        disabled && 'opacity-40 cursor-not-allowed',
        className
      )}
    >
      <div
        className={cn(
          'w-5 h-5 bg-white rounded-full absolute top-1 transition-transform',
          checked ? 'translate-x-6' : 'translate-x-1'
        )}
      />
    </button>
  )
}