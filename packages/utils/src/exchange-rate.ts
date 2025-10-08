/**
 * Exchange Rate Service
 * Fetches real-time currency conversion rates from ExchangeRate-API
 */

const EXCHANGE_RATE_API_BASE = 'https://api.exchangerate-api.com/v4/latest'

export interface ExchangeRates {
  base: string
  date: string
  rates: Record<string, number>
}

export interface ConversionResult {
  rate: number
  convertedAmount: number
  source: 'api' | 'manual'
}

/**
 * Fetch exchange rates for a base currency
 * @param baseCurrency - ISO 4217 currency code (e.g., "EUR", "USD")
 * @returns Exchange rates for all supported currencies
 */
export async function fetchExchangeRates(
  baseCurrency: string
): Promise<ExchangeRates> {
  try {
    const response = await fetch(`${EXCHANGE_RATE_API_BASE}/${baseCurrency}`)
    
    if (!response.ok) {
      throw new Error(`Exchange rate API error: ${response.status} ${response.statusText}`)
    }
    
    const data = await response.json() as ExchangeRates
    return data
  } catch (error) {
    console.error('Failed to fetch exchange rates:', error)
    throw new Error('Unable to fetch exchange rates. Please enter the rate manually.')
  }
}

/**
 * Get exchange rate between two currencies
 * @param fromCurrency - Source currency code
 * @param toCurrency - Target currency code
 * @returns Exchange rate (1 unit of fromCurrency = X units of toCurrency)
 */
export async function getExchangeRate(
  fromCurrency: string,
  toCurrency: string
): Promise<number> {
  // Same currency, rate is 1
  if (fromCurrency === toCurrency) {
    return 1
  }
  
  try {
    const rates = await fetchExchangeRates(fromCurrency)
    const rate = rates.rates[toCurrency]
    
    if (!rate) {
      throw new Error(`Exchange rate not found for ${fromCurrency} → ${toCurrency}`)
    }
    
    return rate
  } catch (error) {
    console.error('Failed to get exchange rate:', error)
    throw error
  }
}

/**
 * Convert amount from one currency to another
 * @param amount - Amount to convert
 * @param fromCurrency - Source currency code
 * @param toCurrency - Target currency code
 * @param manualRate - Optional manual exchange rate override
 * @returns Conversion result with rate and converted amount
 */
export async function convertCurrency(
  amount: number,
  fromCurrency: string,
  toCurrency: string,
  manualRate?: number
): Promise<ConversionResult> {
  // Same currency, no conversion needed
  if (fromCurrency === toCurrency) {
    return {
      rate: 1,
      convertedAmount: amount,
      source: 'manual'
    }
  }
  
  // Use manual rate if provided
  if (manualRate !== undefined && manualRate > 0) {
    return {
      rate: manualRate,
      convertedAmount: amount * manualRate,
      source: 'manual'
    }
  }
  
  // Fetch rate from API
  const rate = await getExchangeRate(fromCurrency, toCurrency)
  
  return {
    rate,
    convertedAmount: amount * rate,
    source: 'api'
  }
}

/**
 * Validate currency code (ISO 4217 format)
 * @param code - Currency code to validate
 * @returns True if valid
 */
export function isValidCurrencyCode(code: string): boolean {
  return /^[A-Z]{3}$/.test(code)
}

/**
 * Common currency codes for quick selection
 */
export const COMMON_CURRENCIES = [
  { code: 'USD', name: 'US Dollar', symbol: '$' },
  { code: 'EUR', name: 'Euro', symbol: '€' },
  { code: 'GBP', name: 'British Pound', symbol: '£' },
  { code: 'JPY', name: 'Japanese Yen', symbol: '¥' },
  { code: 'CHF', name: 'Swiss Franc', symbol: 'CHF' },
  { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$' },
  { code: 'AUD', name: 'Australian Dollar', symbol: 'A$' },
  { code: 'CNY', name: 'Chinese Yuan', symbol: '¥' },
  { code: 'INR', name: 'Indian Rupee', symbol: '₹' },
  { code: 'AED', name: 'UAE Dirham', symbol: 'AED' },
] as const

/**
 * Get currency symbol for display
 * @param code - Currency code
 * @returns Currency symbol or code if not found
 */
export function getCurrencySymbol(code: string): string {
  const currency = COMMON_CURRENCIES.find(c => c.code === code)
  return currency?.symbol || code
}

/**
 * Format amount with currency
 * @param amount - Amount to format (number, string, or Prisma Decimal)
 * @param currency - Currency code
 * @returns Formatted string (e.g., "$100.00", "€50.00")
 */
export function formatCurrency(amount: number | string, currency: string): string {
  const symbol = getCurrencySymbol(currency)
  
  // Handle Prisma Decimal (serialized as string) or number
  let formatted: string
  if (typeof amount === 'string') {
    // Parse string directly, avoiding potential Number precision loss
    const num = Number(amount)
    if (isNaN(num)) {
      throw new Error(`Invalid amount: ${amount}`)
    }
    formatted = num.toFixed(2)
  } else {
    formatted = amount.toFixed(2)
  }
  
  // For currencies with symbol before amount
  if (['$', '£', '€', 'CHF', 'C$', 'A$'].includes(symbol)) {
    return `${symbol}${formatted}`
  }
  
  // For currencies with symbol after amount
  return `${formatted} ${symbol}`
}
