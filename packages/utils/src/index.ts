// Shared utilities and helper functions
export { cn } from './lib/cn'

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
  COMMON_CURRENCIES,
  type ExchangeRates,
  type ConversionResult,
} from './exchange-rate'

// Validation schemas for Finance app
export {
  CreateTransactionSchema,
  UpdateTransactionSchema,
  TransactionFiltersSchema,
  CreateCategorySchema,
  UpdateCategorySchema,
  UpdateUserSettingsSchema,
  TransactionTypeSchema,
  RateSourceSchema,
  CurrencyCodeSchema,
  type CreateTransactionInput,
  type UpdateTransactionInput,
  type TransactionFilters,
  type CreateCategoryInput,
  type UpdateCategoryInput,
  type UpdateUserSettingsInput,
  type TransactionType,
  type RateSource,
} from './validation/finance'
