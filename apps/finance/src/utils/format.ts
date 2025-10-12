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
 * Format date with different styles
 * @param date - The date to format (Date object or ISO string)
 * @param style - The formatting style ('short', 'long', or 'relative')
 * @returns Formatted date string
 */
export function formatDate(
  date: Date | string,
  style: 'short' | 'long' | 'relative' = 'short'
): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date

  if (style === 'relative') {
    return formatRelativeDate(dateObj)
  }

  const options: Intl.DateTimeFormatOptions =
    style === 'long'
      ? { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' }
      : { year: 'numeric', month: 'short', day: 'numeric' }

  return dateObj.toLocaleDateString('en-US', options)
}

/**
 * Format date as relative time (e.g., "Today", "Yesterday", "2 days ago")
 * @param date - The date to format
 * @returns Relative date string
 */
function formatRelativeDate(date: Date): string {
  const now = new Date()
  const diffInMs = now.getTime() - date.getTime()
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24))

  if (diffInDays === 0) {
    return 'Today'
  } else if (diffInDays === 1) {
    return 'Yesterday'
  } else if (diffInDays < 7) {
    return `${diffInDays} days ago`
  } else if (diffInDays < 30) {
    const weeks = Math.floor(diffInDays / 7)
    return `${weeks} ${weeks === 1 ? 'week' : 'weeks'} ago`
  } else if (diffInDays < 365) {
    const months = Math.floor(diffInDays / 30)
    return `${months} ${months === 1 ? 'month' : 'months'} ago`
  } else {
    const years = Math.floor(diffInDays / 365)
    return `${years} ${years === 1 ? 'year' : 'years'} ago`
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

/**
 * Convert date input value to ISO datetime string
 * @param dateString - Date string from input (YYYY-MM-DD)
 * @param timeString - Time string from input (HH:MM) - optional
 * @returns ISO datetime string
 */
export function dateInputToISO(dateString: string, timeString?: string): string {
  if (timeString) {
    return new Date(`${dateString}T${timeString}`).toISOString()
  }
  // Default to noon to avoid timezone issues
  return new Date(`${dateString}T12:00:00`).toISOString()
}

/**
 * Convert ISO datetime string to date input value
 * @param isoString - ISO datetime string
 * @returns Date string for input (YYYY-MM-DD)
 */
export function isoToDateInput(isoString: string): string {
  const date = new Date(isoString)
  return date.toISOString().split('T')[0]
}

/**
 * Convert ISO datetime string to time input value
 * @param isoString - ISO datetime string
 * @returns Time string for input (HH:MM)
 */
export function isoToTimeInput(isoString: string): string {
  const date = new Date(isoString)
  return date.toTimeString().slice(0, 5)
}

