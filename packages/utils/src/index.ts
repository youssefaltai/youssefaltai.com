// Shared utilities and helper functions
export { cn } from './lib/cn'

// PWA utilities
export { createManifest } from './lib/pwa'
export type { PWAManifestConfig, PWAManifest } from './lib/pwa'

// Date utilities (using date-fns)
export {
  parseDate,
  formatDate,
  formatDateTime,
  formatDateShort,
  formatTime,
  formatRelative,
  now,
  todayStart,
  todayEnd,
  currentMonthRange,
  toDateInputValue,
  toDateTimeInputValue,
  fromDateInputValue,
  fromDateTimeInputValue,
  addDays,
  addMonths,
  subDays,
  subMonths,
  startOfMonth,
  endOfMonth,
  startOfDay,
  endOfDay,
  isSameDay,
  isBefore,
  isAfter,
  isToday,
  isYesterday,
} from './lib/date'

// Exchange rate utilities
export {
  fetchExchangeRates,
  getExchangeRate,
  convertCurrency,
  fetchGoldPrice,
  isValidCurrencyCode,
  getCurrencySymbol,
  formatCurrency,
  formatCurrencyCompact,
  COMMON_CURRENCIES,
  type ExchangeRates,
  type ConversionResult,
} from './exchange-rate'

// Text utilities
export { getGreeting, getTransactionColorClass } from './lib/text'
