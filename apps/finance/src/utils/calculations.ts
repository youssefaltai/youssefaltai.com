import { Account, Currency } from '@repo/db'
import { convertAmount, ExchangeRateMap } from '../shared/finance-utils'
import { differenceInDays, parseISO, ensureDate } from '@repo/utils'

/**
 * Calculate net worth (assets - liabilities) in base currency
 * Converts all account balances to base currency using exchange rates
 * 
 * @param accounts - All user accounts
 * @param baseCurrency - User's base currency
 * @param rateMap - Exchange rate map
 * @returns Net worth value in base currency
 */
export function calculateNetWorth(
  accounts: Account[],
  baseCurrency: Currency,
  rateMap: ExchangeRateMap
): number {
  const assets = accounts
    .filter((acc) => acc.type === 'asset')
    .reduce((sum, acc) => {
      try {
        const converted = convertAmount(acc.balance, acc.currency, baseCurrency, rateMap)
        return sum + Number(converted)
      } catch (error) {
        console.warn(`Failed to convert ${acc.name} balance: ${error}`)
        return sum
      }
    }, 0)

  const liabilities = accounts
    .filter((acc) => acc.type === 'liability')
    .reduce((sum, acc) => {
      try {
        const converted = convertAmount(acc.balance, acc.currency, baseCurrency, rateMap)
        return sum + Number(converted)
      } catch (error) {
        console.warn(`Failed to convert ${acc.name} balance: ${error}`)
        return sum
      }
    }, 0)

  return assets - liabilities
}

/**
 * Calculate total balance for a specific account type in base currency
 * Converts all account balances to base currency using exchange rates
 * 
 * @param accounts - All user accounts
 * @param type - Account type to sum
 * @param baseCurrency - User's base currency
 * @param rateMap - Exchange rate map
 * @returns Total balance in base currency
 */
export function calculateTotalBalance(
  accounts: Account[],
  type: 'asset' | 'liability' | 'income' | 'expense',
  baseCurrency: Currency,
  rateMap: ExchangeRateMap
): number {
  return accounts
    .filter((acc) => acc.type === type)
    .reduce((sum, acc) => {
      try {
        const converted = convertAmount(acc.balance, acc.currency, baseCurrency, rateMap)
        return sum + Number(converted)
      } catch (error) {
        console.warn(`Failed to convert ${acc.name} balance: ${error}`)
        return sum
      }
    }, 0)
}

/**
 * Calculate goal progress percentage
 * @param current - Current balance
 * @param target - Target amount
 * @returns Progress percentage (0-100)
 */
export function calculateGoalProgress(current: number, target: number): number {
  if (target <= 0) return 0
  const progress = (current / target) * 100
  return Math.min(Math.max(progress, 0), 100) // Clamp between 0-100
}

/**
 * Calculate credit card utilization percentage
 * @param balance - Current balance (amount owed)
 * @param limit - Credit limit
 * @returns Utilization percentage (0-100)
 */
export function calculateCreditUtilization(balance: number, limit: number): number {
  if (limit <= 0) return 0
  const utilization = (balance / limit) * 100
  return Math.min(Math.max(utilization, 0), 100)
}

/**
 * Calculate days until due date
 * @param dueDate - Due date
 * @returns Number of days (negative if overdue)
 */
export function calculateDaysUntilDue(dueDate: Date | string): number {
  const due = typeof dueDate === 'string' ? parseISO(dueDate) : dueDate
  return differenceInDays(due, new Date())
}

/**
 * Check if due date is approaching (within 30 days)
 * @param dueDate - Due date
 * @returns True if due date is within 30 days
 */
export function isDueDateApproaching(dueDate: Date | string): boolean {
  const days = calculateDaysUntilDue(dueDate)
  return days >= 0 && days <= 30
}

/**
 * Check if due date has passed
 * @param dueDate - Due date
 * @returns True if overdue
 */
export function isOverdue(dueDate: Date | string): boolean {
  return calculateDaysUntilDue(dueDate) < 0
}

/**
 * Format due date status message
 * @param dueDate - Due date
 * @returns User-friendly status message
 */
export function formatDueDateStatus(dueDate: Date | string): string {
  const days = calculateDaysUntilDue(dueDate)
  
  if (days < 0) {
    return `Overdue by ${Math.abs(days)} ${Math.abs(days) === 1 ? 'day' : 'days'}`
  } else if (days === 0) {
    return 'Due today'
  } else if (days === 1) {
    return 'Due tomorrow'
  } else if (days <= 7) {
    return `Due in ${days} days`
  } else if (days <= 30) {
    const weeks = Math.floor(days / 7)
    return `Due in ${weeks} ${weeks === 1 ? 'week' : 'weeks'}`
  } else {
    const months = Math.floor(days / 30)
    return `Due in ${months} ${months === 1 ? 'month' : 'months'}`
  }
}

/**
 * Calculate savings rate as percentage
 * @param income - Total income
 * @param expenses - Total expenses
 * @returns Savings rate percentage (0-100)
 */
export function calculateSavingsRate(income: number, expenses: number): number {
  if (income <= 0) return 0
  const savings = income - expenses
  const rate = (savings / income) * 100
  return Math.max(0, Math.min(100, rate)) // Clamp between 0-100
}

/**
 * Calculate financial health score (0-100)
 * Based on multiple factors: net worth trend, savings rate, credit utilization, on-time payments
 * 
 * @param params - Health score parameters
 * @returns Score from 0-100
 */
export function calculateFinancialHealthScore(params: {
  netWorth: number
  savingsRate: number
  creditUtilization: number
  hasOverduePayments: boolean
}): number {
  const { netWorth, savingsRate, creditUtilization, hasOverduePayments } = params
  
  let score = 0
  
  // Net worth contribution (0-30 points)
  if (netWorth > 0) {
    score += 30
  } else if (netWorth === 0) {
    score += 15
  }
  // If negative, no points
  
  // Savings rate contribution (0-30 points)
  if (savingsRate >= 20) {
    score += 30 // Excellent
  } else if (savingsRate >= 10) {
    score += 20 // Good
  } else if (savingsRate > 0) {
    score += 10 // Fair
  }
  // If negative, no points
  
  // Credit utilization contribution (0-30 points)
  if (creditUtilization === 0) {
    score += 30 // No debt or fully paid
  } else if (creditUtilization <= 30) {
    score += 25 // Excellent
  } else if (creditUtilization <= 50) {
    score += 15 // Good
  } else if (creditUtilization <= 70) {
    score += 5 // Fair
  }
  // Above 70%, no points
  
  // On-time payments contribution (0-10 points)
  if (!hasOverduePayments) {
    score += 10
  }
  
  return Math.min(100, score)
}

/**
 * Calculate spending velocity
 * Shows average daily spend and projects end-of-month spending
 * 
 * @param totalSpent - Amount spent so far
 * @param daysElapsed - Days elapsed in the period
 * @param daysRemaining - Days remaining in the period
 * @returns Velocity metrics
 */
export function calculateSpendingVelocity(
  totalSpent: number,
  daysElapsed: number,
  daysRemaining: number
): {
  dailyAverage: number
  projectedTotal: number
  projectedRemaining: number
} {
  const dailyAverage = daysElapsed > 0 ? totalSpent / daysElapsed : 0
  const projectedRemaining = dailyAverage * daysRemaining
  const projectedTotal = totalSpent + projectedRemaining
  
  return {
    dailyAverage,
    projectedTotal,
    projectedRemaining,
  }
}

/**
 * Forecast goal completion date
 * Based on current balance, target, and average monthly contribution
 * 
 * @param currentBalance - Current saved amount
 * @param target - Target amount
 * @param monthlyContribution - Average monthly contribution
 * @param dueDate - Optional target due date
 * @returns Forecast info
 */
export function forecastGoalCompletion(
  currentBalance: number,
  target: number,
  monthlyContribution: number,
  dueDate?: Date | string
): {
  monthsRemaining: number
  onTrack: boolean
  projectedCompletionDate: Date | null
} {
  const remaining = target - currentBalance
  
  if (remaining <= 0) {
    return {
      monthsRemaining: 0,
      onTrack: true,
      projectedCompletionDate: new Date(),
    }
  }
  
  if (monthlyContribution <= 0) {
    return {
      monthsRemaining: Infinity,
      onTrack: false,
      projectedCompletionDate: null,
    }
  }
  
  const monthsRemaining = Math.ceil(remaining / monthlyContribution)
  const projectedCompletionDate = new Date()
  projectedCompletionDate.setMonth(projectedCompletionDate.getMonth() + monthsRemaining)
  
  let onTrack = true
  if (dueDate) {
    const due = ensureDate(dueDate)
    onTrack = projectedCompletionDate <= due
  }
  
  return {
    monthsRemaining,
    onTrack,
    projectedCompletionDate,
  }
}

