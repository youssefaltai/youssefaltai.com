'use client'

import { NumberInput, Money } from '@repo/ui'
import { Currency } from '@repo/db'

interface CurrencyInputProps {
  value: number
  onChange: (value: number) => void
  currency: Currency
  placeholder?: string
  label?: string
  error?: string
  disabled?: boolean
}

/**
 * Finance-specific wrapper for NumberInput with currency suffix
 * Thin wrapper that combines NumberInput with currency display logic
 */
export function CurrencyInput({
  value,
  onChange,
  currency,
  placeholder = '0.00',
  label,
  error,
  disabled,
}: CurrencyInputProps) {
  // Get currency symbol
  const getCurrencySymbol = () => {
    switch (currency) {
      case 'EGP':
        return 'EGP'
      case 'USD':
        return '$'
      case 'GOLD':
        return 'g'
      default:
        return ''
    }
  }

  return (
    <div className="space-y-1">
      <NumberInput
        value={value}
        onChange={onChange}
        suffix={getCurrencySymbol()}
        placeholder={placeholder}
        label={label}
        error={error}
        disabled={disabled}
        formatOnBlur={true}
        decimalPlaces={2}
      />
      {!error && value > 0 && (
        <p className="text-ios-footnote text-ios-gray-2">
          <Money amount={value} currency={currency} />
        </p>
      )}
    </div>
  )
}
