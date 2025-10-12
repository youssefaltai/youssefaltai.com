'use client'

import { cn } from '@repo/utils'

interface BadgeProps {
  children: React.ReactNode
  variant?: 'info' | 'success' | 'warning' | 'error' | 'neutral'
  className?: string
}

/**
 * Small label badge (for counts, status, etc.)
 * Variants: info, success, warning, error, neutral
 */
export function Badge({ children, variant = 'neutral', className }: BadgeProps) {
  const variantClasses = {
    info: 'bg-ios-blue/10 text-ios-blue',
    success: 'bg-ios-green/10 text-ios-green',
    warning: 'bg-ios-orange/10 text-ios-orange',
    error: 'bg-ios-red/10 text-ios-red',
    neutral: 'bg-ios-gray-6 text-ios-gray-1',
  }

  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-0.5 rounded-full text-ios-caption font-semibold',
        variantClasses[variant],
        className
      )}
    >
      {children}
    </span>
  )
}

