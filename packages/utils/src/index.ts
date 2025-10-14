// PWA utilities
export { createManifest, createViewport } from './lib/pwa'
export type { PWAManifestConfig, PWAManifest, PWAViewport } from './lib/pwa'

// Date utilities - re-exports from date-fns
export * from './lib/date'

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
  formatNumberCompact,
  COMMON_CURRENCIES,
  type ExchangeRates,
  type ConversionResult,
} from './exchange-rate'

// Text utilities
export { getGreeting, getTransactionColorClass } from './lib/text'

// Emoji utilities
export { isValidEmoji } from './lib/emoji'
