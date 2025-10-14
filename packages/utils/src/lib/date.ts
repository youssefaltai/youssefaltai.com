import { parseISO } from 'date-fns'

/**
 * Date and time utilities - re-exports from date-fns
 * Use date-fns directly, no custom wrappers
 */
export {
  format,
  formatRelative,
  parseISO,
  formatDistanceToNow,
  differenceInDays,
  compareAsc,
  isSameMonth,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  startOfDay,
  endOfDay,
  startOfQuarter,
  endOfQuarter,
  addDays,
  addMonths,
  subDays,
  subMonths,
  isSameDay,
  isBefore,
  isAfter,
  isToday,
  isYesterday,
  getDate,
  getDaysInMonth,
  isValid,
  parse,
} from 'date-fns'

/**
 * Ensure a date value is a Date object (not a string)
 * Handles the fact that Prisma types use Date but JSON serialization converts them to strings
 * 
 * @param date - Date object or ISO string
 * @returns Date object
 */
export function ensureDate(date: Date | string): Date {
  return typeof date === 'string' ? parseISO(date) : date
}

