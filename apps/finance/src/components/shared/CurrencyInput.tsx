'use client'

import { NumberInput, Text } from '@mantine/core'
import { Money } from './Money'
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
    <div>
      <NumberInput
        value={value}
        onChange={(val) => onChange(Number(val))}
        suffix={getCurrencySymbol()}
        placeholder={placeholder}
        label={label}
        error={error}
        disabled={disabled}
        decimalScale={2}
        fixedDecimalScale
      />
      {!error && value > 0 && (
        <Text size="xs" c="dimmed" mt={4}>
          <Money amount={value} currency={currency} />
        </Text>
      )}
    </div>
  )
}
