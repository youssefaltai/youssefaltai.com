'use client'

import { useState, useEffect } from 'react'
import { cn } from '@repo/utils'

interface NumberInputProps {
  value: number
  onChange: (value: number) => void
  placeholder?: string
  label?: string
  error?: string
  disabled?: boolean
  prefix?: string
  suffix?: string
  formatOnBlur?: boolean
  decimalPlaces?: number
  className?: string
}

/**
 * Generic number input component with formatting
 * Formats value as user types: 1234.56 → 1,234.56
 * Stores raw number value internally
 * Supports custom prefix/suffix (e.g., "$", "kg", "%" etc.)
 */
export function NumberInput({
  value,
  onChange,
  placeholder = '0.00',
  label,
  error,
  disabled,
  prefix,
  suffix,
  formatOnBlur = true,
  decimalPlaces = 2,
  className,
}: NumberInputProps) {
  const [displayValue, setDisplayValue] = useState('')
  const [isFocused, setIsFocused] = useState(false)

  // Update display value when external value changes
  useEffect(() => {
    if (!isFocused) {
      setDisplayValue(value ? value.toString() : '')
    }
  }, [value, isFocused])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value

    // Remove non-numeric characters except decimal point
    const cleaned = input.replace(/[^0-9.]/g, '')

    // Prevent multiple decimal points
    const parts = cleaned.split('.')
    const formatted = parts.length > 2 ? `${parts[0]}.${parts.slice(1).join('')}` : cleaned

    setDisplayValue(formatted)

    // Convert to number and call onChange
    const numValue = parseFloat(formatted) || 0
    onChange(numValue)
  }

  const handleFocus = () => {
    setIsFocused(true)
  }

  const handleBlur = () => {
    setIsFocused(false)
    // Format the display value when losing focus
    if (formatOnBlur && value) {
      setDisplayValue(value.toFixed(decimalPlaces))
    }
  }

  return (
    <div className={cn('space-y-1', className)}>
      {label && (
        <label className="block text-ios-footnote text-ios-gray-1 font-medium">
          {label}
        </label>
      )}
      <div className="relative">
        {prefix && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-ios-body text-ios-gray-2 pointer-events-none">
            {prefix}
          </div>
        )}
        <input
          type="text"
          inputMode="decimal"
          value={displayValue}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={placeholder}
          disabled={disabled}
          className={cn(
            'w-full h-11 px-4 bg-ios-gray-6 rounded-ios text-ios-body text-ios-label-primary placeholder:text-ios-gray-2',
            'focus:outline-none focus:ring-2 focus:ring-ios-blue focus:bg-white',
            'transition-all',
            'disabled:opacity-40 disabled:cursor-not-allowed',
            error && 'ring-2 ring-ios-red focus:ring-ios-red',
            prefix && 'pl-8',
            suffix && 'pr-12'
          )}
        />
        {suffix && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2 text-ios-body text-ios-gray-2 pointer-events-none">
            {suffix}
          </div>
        )}
      </div>
      {error && (
        <p className="text-ios-footnote text-ios-red">{error}</p>
      )}
    </div>
  )
}

