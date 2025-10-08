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
 * Special handling for gold (GOLD_G = grams of 24K gold)
 * 
 * @param amount - Amount to convert
 * @param fromCurrency - Source currency code (EGP, USD, GOLD_G)
 * @param toCurrency - Target currency code (typically EGP)
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
  
  // Special handling for gold
  if (fromCurrency === 'GOLD_G') {
    // Gold → EGP: Fetch gold price per gram in EGP
    if (toCurrency === 'EGP') {
      try {
        const pricePerGram = await fetchGoldPrice()
        return {
          rate: pricePerGram,
          convertedAmount: amount * pricePerGram,
          source: 'api'
        }
      } catch (error) {
        // API unavailable, force manual entry
        throw new Error('Gold price unavailable. Please enter EGP per gram manually.')
      }
    }
    
    // Gold → Other currency: Not supported, must enter manually
    throw new Error('Gold conversion to non-EGP currency requires manual rate entry.')
  }
  
  if (toCurrency === 'GOLD_G') {
    // Currency → Gold: Not supported, must enter manually
    throw new Error('Converting to gold requires manual rate entry (enter grams per currency unit).')
  }
  
  // Regular currency conversion
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
 * Custom: GOLD_G = grams of 24 karat gold (not XAU)
 */
export const COMMON_CURRENCIES = [
  { code: 'EGP', name: 'Egyptian Pound', symbol: 'E£' },
  { code: 'USD', name: 'US Dollar', symbol: '$' },
  { code: 'GOLD_G', name: 'Gold (grams, 24K)', symbol: 'g' },
] as const

/**
 * Gold price API for fetching current gold prices
 * Using GoldAPI.io (free tier: 100 requests/month)
 */
const GOLD_API_KEY = process.env.GOLD_API_KEY || '' // Optional: add if you want real-time prices
const GOLD_API_BASE = 'https://www.goldapi.io/api'

/**
 * Fetch current gold price in EGP per gram (24K)
 * Falls back to manual entry if API unavailable
 */
export async function fetchGoldPrice(): Promise<number> {
  // If no API key, throw error to force manual entry
  if (!GOLD_API_KEY) {
    throw new Error('Gold price API not configured. Please enter price manually.')
  }

  try {
    const response = await fetch(`${GOLD_API_BASE}/XAU/EGP`, {
      headers: { 'x-access-token': GOLD_API_KEY }
    })
    
    if (!response.ok) {
      throw new Error('Failed to fetch gold price')
    }
    
    const data = await response.json() as any
    // API returns price per troy ounce, convert to grams
    // 1 troy ounce = 31.1035 grams
    const pricePerGram = data.price_gram_24k || (data.price / 31.1035)
    
    return pricePerGram
  } catch (error) {
    console.error('Failed to fetch gold price:', error)
    throw new Error('Unable to fetch gold price. Please enter the price manually.')
  }
}

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
 * Special handling for gold (shows grams with 3 decimal places)
 * 
 * @param amount - Amount to format (number, string, or Prisma Decimal)
 * @param currency - Currency code (EGP, USD, GOLD_G)
 * @returns Formatted string (e.g., "$100.00", "E£50.00", "125.500g")
 */
export function formatCurrency(amount: number | string, currency: string): string {
  const symbol = getCurrencySymbol(currency)
  
  // Handle Prisma Decimal (serialized as string) or number
  let numericAmount: number
  if (typeof amount === 'string') {
    numericAmount = Number(amount)
    if (isNaN(numericAmount)) {
      throw new Error(`Invalid amount: ${amount}`)
    }
  } else {
    numericAmount = amount
  }
  
  // Determine decimal places based on currency
  let decimalPlaces = 2
  if (currency === 'GOLD_G') {
    decimalPlaces = 3 // Gold measured in grams needs more precision
  }
  
  const formatted = numericAmount.toFixed(decimalPlaces)
  
  // Special formatting for gold
  if (currency === 'GOLD_G') {
    return `${formatted}g`
  }
  
  // For currencies with symbol before amount
  if (['$', '£', '€', 'E£', 'CHF', 'C$', 'A$'].includes(symbol)) {
    return `${symbol}${formatted}`
  }
  
  // For currencies with symbol after amount
  return `${formatted} ${symbol}`
}
