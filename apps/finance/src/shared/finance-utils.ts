import { Currency, Prisma } from "@repo/db"

/**
 * Result of currency conversion calculation
 */
export interface CurrencyConversionResult {
  amountToDeduct: Prisma.Decimal
  amountToIncrement: Prisma.Decimal
  currency: Currency
  exchangeRate: Prisma.Decimal | null
}

interface CurrencyConversionInput {
  amount: number | Prisma.Decimal
  fromCurrency: Currency
  toCurrency: Currency
  providedCurrency?: Currency
  providedExchangeRate?: number | Prisma.Decimal | null
}

/**
 * Calculates amounts to deduct and increment for a transaction between two accounts.
 * Handles both same-currency and cross-currency transactions.
 * 
 * @param amount - Base transaction amount
 * @param fromCurrency - Currency of the account money is leaving
 * @param toCurrency - Currency of the account money is entering
 * @param providedCurrency - Optional currency specified for the transaction
 * @param providedExchangeRate - Optional exchange rate (required for cross-currency)
 * @returns Conversion result with amounts and final currency/rate
 * @throws Error if cross-currency requirements not met
 */
export function calculateCurrencyConversion(
  input: CurrencyConversionInput
): CurrencyConversionResult {
  const { amount, fromCurrency, toCurrency, providedCurrency, providedExchangeRate } = input
  const baseAmount = new Prisma.Decimal(amount)

  // Same currency - no conversion needed
  if (fromCurrency === toCurrency) {
    return {
      amountToDeduct: baseAmount,
      amountToIncrement: baseAmount,
      currency: fromCurrency,
      exchangeRate: null,
    }
  }

  // Cross-currency - validate requirements
  if (!providedCurrency) {
    throw new Error("Currency is required for cross-currency transactions")
  }

  if (!providedExchangeRate || new Prisma.Decimal(providedExchangeRate).lte(0)) {
    throw new Error(
      "Exchange rate is required for cross-currency transactions. " +
      "Please set a default rate in Settings or provide one manually."
    )
  }

  // Validate transaction currency matches one of the accounts
  if (providedCurrency !== fromCurrency && providedCurrency !== toCurrency) {
    throw new Error("Transaction currency must match either fromAccount or toAccount currency")
  }

  const rate = new Prisma.Decimal(providedExchangeRate)
  const isInFromCurrency = providedCurrency === fromCurrency

  // Exchange rate: 1 fromCurrency = rate × toCurrency (e.g., 1 USD = 50 EGP)
  const amountToDeduct = isInFromCurrency ? baseAmount : baseAmount.div(rate)
  const amountToIncrement = isInFromCurrency ? baseAmount.mul(rate) : baseAmount

  return {
    amountToDeduct,
    amountToIncrement,
    currency: providedCurrency,
    exchangeRate: rate,
  }
}

/**
 * Reverses a transaction's currency conversion.
 * Used when deleting or updating a transaction to restore account balances.
 * 
 * @param amount - Original transaction amount
 * @param currency - Original transaction currency
 * @param fromCurrency - Currency of the account money left
 * @param toCurrency - Currency of the account money entered
 * @param exchangeRate - Original exchange rate (null for same-currency)
 * @returns Amounts to restore and remove from accounts
 * @throws Error if data is inconsistent
 */
export function reverseCurrencyConversion(
  amount: Prisma.Decimal,
  currency: Currency,
  fromCurrency: Currency,
  toCurrency: Currency,
  exchangeRate: Prisma.Decimal | null
): { amountToRestore: Prisma.Decimal; amountToRemove: Prisma.Decimal } {
  // Same currency - no conversion needed
  if (fromCurrency === toCurrency) {
    return {
      amountToRestore: amount,
      amountToRemove: amount,
    }
  }

  // Cross-currency - must have exchange rate
  if (!exchangeRate) {
    throw new Error("Cannot reverse transaction: missing exchange rate data")
  }

  const isInFromCurrency = currency === fromCurrency
  const amountToRestore = isInFromCurrency ? amount : amount.div(exchangeRate)
  const amountToRemove = isInFromCurrency ? amount.mul(exchangeRate) : amount

  return { amountToRestore, amountToRemove }
}

/**
 * Exchange rate map for easy lookup
 */
export type ExchangeRateMap = Map<string, Prisma.Decimal>

/**
 * Get exchange rate key for lookup
 */
function getExchangeRateKey(fromCurrency: Currency, toCurrency: Currency): string {
  return `${fromCurrency}_TO_${toCurrency}`
}

/**
 * Find exchange rate from the map (checks both directions)
 * 
 * @param fromCurrency - Source currency
 * @param toCurrency - Target currency
 * @param rateMap - Map of exchange rates
 * @returns Exchange rate or null if not found
 */
export function findExchangeRate(
  fromCurrency: Currency,
  toCurrency: Currency,
  rateMap: ExchangeRateMap
): Prisma.Decimal | null {
  // Same currency = 1:1
  if (fromCurrency === toCurrency) {
    return new Prisma.Decimal(1)
  }

  // Check direct rate
  const directKey = getExchangeRateKey(fromCurrency, toCurrency)
  if (rateMap.has(directKey)) {
    return rateMap.get(directKey)!
  }

  // Check inverse rate
  const inverseKey = getExchangeRateKey(toCurrency, fromCurrency)
  if (rateMap.has(inverseKey)) {
    const inverseRate = rateMap.get(inverseKey)!
    return new Prisma.Decimal(1).div(inverseRate)
  }

  return null
}

/**
 * Convert amount from one currency to another using provided exchange rates
 * 
 * @param amount - Amount to convert
 * @param fromCurrency - Source currency
 * @param toCurrency - Target currency
 * @param rateMap - Map of exchange rates
 * @returns Converted amount
 * @throws Error if exchange rate not found
 */
export function convertAmount(
  amount: Prisma.Decimal | number,
  fromCurrency: Currency,
  toCurrency: Currency,
  rateMap: ExchangeRateMap
): Prisma.Decimal {
  const decimalAmount = new Prisma.Decimal(amount)

  // Same currency - no conversion needed
  if (fromCurrency === toCurrency) {
    return decimalAmount
  }

  // Find exchange rate
  const rate = findExchangeRate(fromCurrency, toCurrency, rateMap)
  
  if (!rate) {
    throw new Error(
      `Exchange rate not found for ${fromCurrency} to ${toCurrency}. Please set it in settings.`
    )
  }

  return decimalAmount.mul(rate)
}

