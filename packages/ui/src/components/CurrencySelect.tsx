/**
 * CurrencySelect Component
 * Generic currency selector that accepts currencies as props
 */
import { Select } from './Input'

interface CurrencyOption {
  value: string
  label: string
}

interface CurrencySelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'children'> {
  label?: string
  error?: string
  currencies: CurrencyOption[]
  includeEmpty?: boolean
  emptyLabel?: string
}

/**
 * Generic currency select component
 * Accepts currency options as props to maintain separation of concerns
 */
export function CurrencySelect({
  label = 'Currency',
  error,
  currencies,
  includeEmpty = false,
  emptyLabel = 'Select currency...',
  ...props
}: CurrencySelectProps) {
  return (
    <Select label={label} error={error} {...props}>
      {includeEmpty && <option value="">{emptyLabel}</option>}
      {currencies.map((currency) => (
        <option key={currency.value} value={currency.value}>
          {currency.label}
        </option>
      ))}
    </Select>
  )
}
