/**
 * Text utility functions
 */

/**
 * Get time-of-day greeting
 * @returns Greeting based on current hour (Morning, Afternoon, Evening)
 */
export function getGreeting(): 'Morning' | 'Afternoon' | 'Evening' {
  const hour = new Date().getHours()
  if (hour < 12) return 'Morning'
  if (hour < 18) return 'Afternoon'
  return 'Evening'
}

/**
 * Get CSS color class for transaction type
 * @param type - Transaction type (income or expense)
 * @returns Tailwind color class
 */
export function getTransactionColorClass(type: 'income' | 'expense'): string {
  return type === 'income' ? 'text-ios-green' : 'text-ios-red'
}

