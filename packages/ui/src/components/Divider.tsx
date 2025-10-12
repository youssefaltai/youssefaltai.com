'use client'

interface DividerProps {
  label?: string
  className?: string
}

/**
 * Horizontal divider with optional label
 */
export function Divider({ label, className }: DividerProps) {
  if (label) {
    return (
      <div className={`relative ${className || ''}`}>
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-ios-gray-5" />
        </div>
        <div className="relative flex justify-center text-ios-caption">
          <span className="bg-ios-gray-6 px-2 text-ios-gray-2">
            {label}
          </span>
        </div>
      </div>
    )
  }

  return <div className={`border-t border-ios-gray-5 ${className || ''}`} />
}

