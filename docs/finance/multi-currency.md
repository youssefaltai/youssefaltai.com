# Multi-Currency System

The Finance app supports multiple currencies with historical exchange rate tracking. This document explains the approach and implementation.

## Core Principle

**Every account has a currency. Transactions can cross currencies with proper exchange rate handling.**

## Supported Currencies

```typescript
enum Currency {
  EGP  // Egyptian Pound
  USD  // US Dollar
  GOLD // Gold (grams)
}
```

Each user has a `baseCurrency` preference (default: EGP) used for reporting and calculations.

## Transaction Currency Rules

### Same-Currency Transactions

When both accounts have the same currency, no conversion is needed:

```typescript
Transaction {
  fromAccount: "Bank EGP" (currency: EGP)
  toAccount: "Groceries" (currency: EGP)
  amount: 500
  currency: EGP          // Optional - defaults to account currency
  exchangeRate: null     // No conversion needed
}

Balance Updates:
- Bank EGP: -500 EGP
- Groceries: +500 EGP
```

### Cross-Currency Transactions

When accounts have different currencies, you MUST provide:
1. **Transaction currency** - Must match one of the two accounts
2. **Exchange rate** - Conversion rate at transaction time

```typescript
Transaction {
  fromAccount: "Bank USD" (currency: USD)
  toAccount: "Bank EGP" (currency: EGP)
  amount: 100
  currency: USD           // REQUIRED - matches fromAccount
  exchangeRate: 50        // REQUIRED - 1 USD = 50 EGP
}

Balance Updates:
- Bank USD: -100 USD
- Bank EGP: +5,000 EGP   // 100 * 50
```

## Exchange Rate Semantics

**The exchange rate is always: 1 FROM currency = rate × TO currency**

Examples:

### USD to EGP (USD is transaction currency)
```typescript
amount: 100 USD
exchangeRate: 50
Result:
- Deduct from USD account: 100 USD
- Add to EGP account: 5,000 EGP (100 × 50)
```

### EGP to USD (EGP is transaction currency)
```typescript
amount: 5000 EGP
exchangeRate: 50  // Still means 1 USD = 50 EGP
Result:
- Deduct from USD account: 100 USD (5000 ÷ 50)
- Add to EGP account: 5,000 EGP
```

## Implementation: Currency Conversion

The core logic is in `calculateCurrencyConversion()`:

```typescript
calculateCurrencyConversion({
  amount: 100,
  fromCurrency: Currency.USD,
  toCurrency: Currency.EGP,
  providedCurrency: Currency.USD,
  providedExchangeRate: 50,
})

Returns:
{
  amountToDeduct: Decimal(100),      // Deduct from USD account
  amountToIncrement: Decimal(5000),  // Add to EGP account
  currency: Currency.USD,
  exchangeRate: Decimal(50),
}
```

### Logic Flow

1. **Same Currency**: Return amount as-is, no rate needed

2. **Cross-Currency**: Validate requirements
   - Currency must be provided
   - Exchange rate must be positive
   - Currency must match one of the accounts

3. **Calculate Amounts**:
   - If transaction currency = FROM currency:
     - `amountToDeduct = amount`
     - `amountToIncrement = amount × rate`
   - If transaction currency = TO currency:
     - `amountToDeduct = amount ÷ rate`
     - `amountToIncrement = amount`

## Validation Rules

### At Schema Level (Zod)

```typescript
createTransactionSchema
  .refine(currencyRequiredWithExchangeRateRefinement(), {
    message: "Currency is required when exchange rate is provided"
  })
```

### At Business Logic Level

```typescript
// In calculateCurrencyConversion()
if (fromCurrency !== toCurrency) {
  if (!providedCurrency) {
    throw Error("Currency required for cross-currency transactions")
  }
  if (!providedExchangeRate || rate <= 0) {
    throw Error("Exchange rate required and must be positive")
  }
  if (providedCurrency !== fromCurrency && providedCurrency !== toCurrency) {
    throw Error("Transaction currency must match one of the accounts")
  }
}
```

## Historical Accuracy

**Exchange rates are stored with each transaction and never recalculated.**

This ensures:
- Historical reports are accurate
- Past transactions reflect real exchange rates at the time
- Future exchange rate changes don't affect past data

### Example Timeline

```
Jan 1, 2024:
- Create transaction: 100 USD → Bank EGP
- Exchange rate: 48 EGP/USD
- Stored: amount=100, currency=USD, exchangeRate=48

June 1, 2024:
- Exchange rate changes to 52 EGP/USD
- January transaction STILL shows 48 EGP/USD
- New transactions use 52 EGP/USD
```

## Reversing Transactions

When deleting or updating a transaction, we must reverse the currency conversion using the ORIGINAL exchange rate:

```typescript
reverseCurrencyConversion(
  amount,         // Original transaction amount
  currency,       // Original transaction currency
  fromCurrency,   // Original FROM account currency
  toCurrency,     // Original TO account currency
  exchangeRate    // Original exchange rate
)

Returns:
{
  amountToRestore: Decimal,   // Add back to FROM account
  amountToRemove: Decimal,    // Remove from TO account
}
```

This ensures balance updates are perfectly symmetrical.

## Opening Balances with Currency

When creating an account with opening balance in a different currency than the user's base currency:

```typescript
// User base currency: EGP
// New account: USD with opening balance 1,000 USD
// Opening Balances account: EGP

// Uses 1:1 placeholder rate (warning logged)
exchangeRate: 1
```

**Note**: This is a known limitation. In production, you'd fetch actual exchange rates or let users specify the rate.

## Data Precision

- **Amount**: `Decimal(18, 2)` - 2 decimal places (cents/fils)
- **Exchange Rate**: `Decimal(18, 6)` - 6 decimal places (high precision)

Using `Decimal` type (not `Float`) ensures:
- No floating-point rounding errors
- Exact arithmetic for financial calculations
- Consistent precision

## Error Handling

### Missing Requirements
```typescript
// Cross-currency without currency
{
  fromAccount: USD,
  toAccount: EGP,
  exchangeRate: 50,
  // Missing: currency
}
→ Error: "Currency is required for cross-currency transactions"
```

### Invalid Currency
```typescript
// Cross-currency with non-matching currency
{
  fromAccount: USD,
  toAccount: EGP,
  currency: GOLD,
  exchangeRate: 50,
}
→ Error: "Transaction currency must match one of the accounts"
```

### Missing Exchange Rate
```typescript
// Cross-currency without rate
{
  fromAccount: USD,
  toAccount: EGP,
  currency: USD,
  // Missing: exchangeRate
}
→ Error: "Exchange rate is required and must be positive"
```

## Frontend UX Considerations

### Creating a Transaction

1. **User selects FROM and TO accounts**
2. **System detects if cross-currency**
3. **If cross-currency**:
   - Show currency selector (locked to account currencies)
   - Show exchange rate input
   - Show calculated amounts for both accounts
4. **If same currency**:
   - Hide currency and exchange rate fields
   - Show simple amount input

### Example UI Flow

```
FROM: Bank USD (Balance: 1,000 USD)
TO: Bank EGP (Balance: 10,000 EGP)

→ System detects cross-currency

Amount: [100] Currency: [USD ▼]
Exchange Rate: [50] (1 USD = 50 EGP)

Preview:
- Bank USD: 1,000 → 900 USD (-100)
- Bank EGP: 10,000 → 15,000 EGP (+5,000)
```

## Testing Cross-Currency Logic

### Test Case 1: USD to EGP
```typescript
Input:
  amount: 100
  fromCurrency: USD
  toCurrency: EGP
  providedCurrency: USD
  providedExchangeRate: 50

Expected:
  amountToDeduct: 100
  amountToIncrement: 5000
  currency: USD
  exchangeRate: 50
```

### Test Case 2: EGP to USD
```typescript
Input:
  amount: 5000
  fromCurrency: USD
  toCurrency: EGP
  providedCurrency: EGP
  providedExchangeRate: 50

Expected:
  amountToDeduct: 100     // 5000 ÷ 50
  amountToIncrement: 5000
  currency: EGP
  exchangeRate: 50
```

### Test Case 3: Same Currency
```typescript
Input:
  amount: 100
  fromCurrency: EGP
  toCurrency: EGP

Expected:
  amountToDeduct: 100
  amountToIncrement: 100
  currency: EGP
  exchangeRate: null
```

## Future Enhancements

1. **Exchange Rate API Integration**: Auto-fetch current rates from external API
2. **Rate Caching**: Cache daily rates to reduce API calls
3. **Rate History**: Store historical rates for reference
4. **Multi-Base Currency Reports**: Allow viewing reports in any currency
5. **Currency Conversion Preview**: Show real-time preview before saving transaction

## Next Steps

- Review [Architecture](./architecture.md) to see where this logic lives
- Check [API Reference](./api-reference.md) for endpoint details

