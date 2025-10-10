/**
 * Button Component
 * Follows Apple Human Interface Guidelines
 */
import { cn } from '@repo/utils'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'destructive' | 'plain'
  size?: 'sm' | 'md' | 'lg'
  children: React.ReactNode
}

export function Button({
  variant = 'primary',
  size = 'md',
  className,
  children,
  disabled,
  ...props
}: ButtonProps) {
  const variants = {
    primary: 'bg-ios-blue text-white hover:bg-ios-blue/90',
    secondary: 'bg-ios-blue/10 text-ios-blue hover:bg-ios-blue/15',
    destructive: 'bg-ios-red text-white hover:bg-ios-red/90',
    plain: 'bg-transparent text-ios-blue hover:bg-ios-gray-6',
  }

  const sizes = {
    sm: 'px-4 py-2 text-ios-callout',
    md: 'px-6 py-3 text-ios-body',
    lg: 'px-8 py-4 text-ios-headline',
  }

  return (
    <button
      className={cn(
        // Base styles
        'rounded-ios font-semibold',
        'active:scale-95 transition-all duration-ios',
        'disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100',
        // Size
        sizes[size],
        // Variant
        variants[variant],
        className
      )}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  )
}
