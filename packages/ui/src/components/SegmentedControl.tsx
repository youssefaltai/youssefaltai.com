import { cn } from '@repo/utils'

export interface SegmentedControlOption<T extends string = string> {
  value: T
  label: string
}

interface SegmentedControlProps<T extends string = string> {
  options: SegmentedControlOption<T>[]
  value: T
  onChange: (value: T) => void
  className?: string
}

/**
 * iOS-style segmented control
 * A group of buttons where only one can be selected at a time
 */
export function SegmentedControl<T extends string = string>({
  options,
  value,
  onChange,
  className,
}: SegmentedControlProps<T>) {
  return (
    <div className={cn('bg-ios-gray-6 rounded-ios-sm p-0.5 flex gap-0.5', className)}>
      {options.map((option) => (
        <button
          key={option.value}
          onClick={() => onChange(option.value)}
          className={cn(
            'flex-1 py-2 rounded-[7px] font-semibold text-ios-callout transition-all',
            value === option.value
              ? 'bg-white text-ios-label-primary shadow-sm'
              : 'text-ios-gray-1 hover:text-ios-label-primary'
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  )
}

