import { Account } from '@repo/db'

/**
 * Calculate net worth (assets - liabilities)
 * @param accounts - All user accounts
 * @returns Net worth value
 */
export function calculateNetWorth(accounts: Account[]): number {
  const assets = accounts
    .filter((acc) => acc.type === 'asset')
    .reduce((sum, acc) => sum + Number(acc.balance), 0)

  const liabilities = accounts
    .filter((acc) => acc.type === 'liability')
    .reduce((sum, acc) => sum + Number(acc.balance), 0)

  return assets - liabilities
}

/**
 * Calculate total balance for a specific account type
 * @param accounts - All user accounts
 * @param type - Account type to sum
 * @returns Total balance
 */
export function calculateTotalBalance(
  accounts: Account[],
  type: 'asset' | 'liability' | 'income' | 'expense'
): number {
  return accounts
    .filter((acc) => acc.type === type)
    .reduce((sum, acc) => sum + Number(acc.balance), 0)
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
  const due = typeof dueDate === 'string' ? new Date(dueDate) : dueDate
  const now = new Date()
  const diffInMs = due.getTime() - now.getTime()
  return Math.floor(diffInMs / (1000 * 60 * 60 * 24))
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

