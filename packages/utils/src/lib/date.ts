/**
 * Date and time utilities using date-fns
 * All dates stored as full timestamps (UTC) in database
 * Provides flexible formatting for display
 */
import {
  format,
  parseISO,
  formatDistanceToNow,
  startOfMonth,
  endOfMonth,
  startOfDay,
  endOfDay,
  addDays as dateFnsAddDays,
  addMonths as dateFnsAddMonths,
  subDays,
  subMonths,
  isToday,
  isYesterday,
  isSameDay as dateFnsIsSameDay,
  isBefore,
  isAfter,
} from 'date-fns'

/**
 * Parse ISO date/datetime string to Date object
 * Handles both full timestamps and date-only strings
 */
export function parseDate(dateString: string): Date {
  return parseISO(dateString)
}

/**
 * Format date for display (date only, no time)
 * @example formatDate("2024-01-15T14:30:00Z") → "Jan 15, 2024"
 */
export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? parseISO(date) : date
  return format(d, 'PP')  // "Jan 15, 2024"
}

/**
 * Format date with time
 * @example formatDateTime("2024-01-15T14:30:00Z") → "Jan 15, 2024 at 2:30 PM"
 */
export function formatDateTime(date: Date | string): string {
  const d = typeof date === 'string' ? parseISO(date) : date
  return format(d, 'PPp')  // "Jan 15, 2024 at 2:30 PM"
}

/**
 * Format as short date
 * @example formatDateShort("2024-01-15T14:30:00Z") → "Jan 15, 2024"
 */
export function formatDateShort(date: Date | string): string {
  const d = typeof date === 'string' ? parseISO(date) : date
  return format(d, 'MMM d, yyyy')
}

/**
 * Format time only
 * @example formatTime("2024-01-15T14:30:00Z") → "2:30 PM"
 */
export function formatTime(date: Date | string): string {
  const d = typeof date === 'string' ? parseISO(date) : date
  return format(d, 'p')  // "2:30 PM"
}

/**
 * Format relative time (e.g., "2 days ago", "in 3 hours")
 * Shows "Today" or "Yesterday" for recent dates
 */
export function formatRelative(date: Date | string): string {
  const d = typeof date === 'string' ? parseISO(date) : date
  
  if (isToday(d)) return 'Today'
  if (isYesterday(d)) return 'Yesterday'
  
  return formatDistanceToNow(d, { addSuffix: true })
}

/**
 * Get current date/time
 */
export function now(): Date {
  return new Date()
}

/**
 * Get today at start of day (00:00:00)
 */
export function todayStart(): Date {
  return startOfDay(new Date())
}

/**
 * Get today at end of day (23:59:59)
 */
export function todayEnd(): Date {
  return endOfDay(new Date())
}

/**
 * Get current month date range
 */
export function currentMonthRange(): { start: Date; end: Date } {
  const now = new Date()
  return {
    start: startOfMonth(now),
    end: endOfMonth(now),
  }
}

/**
 * Convert Date to string for <input type="date">
 * @example toDateInputValue(new Date()) → "2024-01-15"
 */
export function toDateInputValue(date: Date): string {
  return format(date, 'yyyy-MM-dd')
}

/**
 * Convert Date to string for <input type="datetime-local">
 * @example toDateTimeInputValue(new Date()) → "2024-01-15T14:30"
 */
export function toDateTimeInputValue(date: Date): string {
  return format(date, "yyyy-MM-dd'T'HH:mm")
}

/**
 * Parse date from <input type="date"> value
 * Sets time to noon to avoid timezone issues
 */
export function fromDateInputValue(dateString: string): Date {
  return parseISO(dateString + 'T12:00:00')
}

/**
 * Parse datetime from <input type="datetime-local"> value
 */
export function fromDateTimeInputValue(dateTimeString: string): Date {
  return parseISO(dateTimeString)
}

// Re-export common date-fns functions for convenience
export {
  dateFnsAddDays as addDays,
  dateFnsAddMonths as addMonths,
  dateFnsIsSameDay as isSameDay,
  subDays,
  subMonths,
  startOfMonth,
  endOfMonth,
  startOfDay,
  endOfDay,
  isBefore,
  isAfter,
  isToday,
  isYesterday,
}

