import { cn } from '@repo/utils'

interface ProgressBarProps {
  percentage: number
  color?: 'blue' | 'green' | 'orange' | 'red'
  height?: 'sm' | 'md' | 'lg'
  className?: string
}

/**
 * Progress bar component with configurable color and height
 * Follows Apple HIG for progress indicators
 */
export function ProgressBar({
  percentage,
  color = 'blue',
  height = 'sm',
  className,
}: ProgressBarProps) {
  const colors = {
    blue: 'bg-ios-blue',
    green: 'bg-ios-green',
    orange: 'bg-ios-orange',
    red: 'bg-ios-red',
  }

  const heights = {
    sm: 'h-2',
    md: 'h-3',
    lg: 'h-4',
  }

  const clampedPercentage = Math.min(Math.max(percentage, 0), 100)

  return (
    <div className={cn('w-full bg-ios-gray-5 rounded-full overflow-hidden', heights[height], className)}>
      <div
        className={cn('h-full transition-all duration-300', colors[color])}
        style={{ width: `${clampedPercentage}%` }}
        role="progressbar"
        aria-valuenow={clampedPercentage}
        aria-valuemin={0}
        aria-valuemax={100}
      />
    </div>
  )
}

