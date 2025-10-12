import { Currency } from '@repo/db'

/**
 * Format currency with proper symbol and formatting
 * @param amount - The amount to format
 * @param currency - The currency type
 * @returns Formatted currency string (e.g., "EGP 1,234.56", "$1,234.56", "1.5g Gold")
 */
export function formatCurrency(amount: number | string, currency: Currency): string {
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount
  
  // Handle different currency types
  switch (currency) {
    case 'EGP':
      return `EGP ${numAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    case 'USD':
      return `$${numAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    case 'GOLD':
      return `${numAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}g Gold`
    default:
      return numAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  }
}

/**
 * Format percentage
 * @param value - The value to format (0-100)
 * @returns Formatted percentage string (e.g., "75%")
 */
export function formatPercentage(value: number): string {
  return `${Math.round(value)}%`
}

