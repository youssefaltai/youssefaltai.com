# Finance App - Multi-Currency Implementation Research

## Problem Statement
Build a personal finance app with transaction tracking and multi-currency support that maintains historical accuracy and avoids common currency calculation pitfalls.

## Requirements
- Transaction CRUD (income/expense)
- Custom categories per user
- Date tracking and descriptions
- Multi-currency with historical exchange rate tracking
- Base currency conversion for accurate reporting

## Candidate Approaches

### 1. Store Original + Converted (Chosen)
Store both original amount/currency and converted baseAmount with historical exchange rate.

**Pros:**
- Historical accuracy preserved
- Fast calculations (sum baseAmount)
- Original transaction details retained
- Can recalculate if base currency changes

**Cons:**
- Slightly more storage
- Need exchange rate API

### 2. Store Original Only
Store only original currency, convert on read using current rates.

**Rejected:** Historical inaccuracy, totals fluctuate with market rates.

### 3. Store Converted Only
Store only base currency amount.

**Rejected:** Lose original transaction details, can't show what was actually paid.

## Chosen Approach: Hybrid Storage

### Database Schema
```prisma
model Transaction {
  // Original transaction
  amount          Decimal   // What was actually paid
  currency        String    // Original currency code
  
  // Conversion (locked at transaction time)
  exchangeRate    Decimal   // Rate used for conversion
  baseAmount      Decimal   // Converted to user's base currency
  baseCurrency    String    // User's base currency
  
  // Details
  type            String    // "income" or "expense"
  category        String    // User-defined
  description     String?
  date            DateTime
}

model Category {
  // User-defined categories
  name            String
  type            String    // "income" or "expense"
  color           String?
}

model UserSettings {
  baseCurrency    String    // User's primary currency (EUR, USD, etc.)
}
```

### Exchange Rate Service

**Provider:** ExchangeRate-API (https://www.exchangerate-api.com/)
- ✅ Free tier: 1,500 requests/month
- ✅ 161 currencies supported
- ✅ Daily updates
- ✅ No authentication required for free tier
- ✅ HTTPS support

**Endpoint:**
```
GET https://api.exchangerate-api.com/v4/latest/{base_currency}
```

**Response:**
```json
{
  "base": "EUR",
  "rates": {
    "USD": 1.08,
    "GBP": 0.85,
    "JPY": 163.45
  }
}
```

**Alternative (fallback):** Manual rate entry

### Business Logic

#### Creating Transaction
1. User enters amount in any currency
2. If currency === baseCurrency: exchangeRate = 1, baseAmount = amount
3. Else: Fetch rate from API, calculate baseAmount = amount × exchangeRate
4. Store all fields (amount, currency, exchangeRate, baseAmount, baseCurrency)

#### Calculating Totals
- Always sum `baseAmount` field
- Never recalculate with current rates
- Fast queries, no external API calls needed

#### Changing Base Currency
1. Fetch conversion rate for migration date
2. Recalculate all baseAmount values
3. Preserve original amounts and exchangeRates

### Key Commands & References

**Exchange Rate API:**
- Docs: https://www.exchangerate-api.com/docs/overview
- Free tier limits: 1,500 requests/month
- Rate limits: None on free tier
- No API key required for basic usage

**Prisma Decimal:**
- Use `@db.Decimal(12, 2)` for money (max: 9,999,999,999.99)
- Use `@db.Decimal(12, 6)` for exchange rates (precision: 0.000001)
- Docs: https://www.prisma.io/docs/orm/reference/prisma-schema-reference#decimal

**Currency Codes:**
- ISO 4217 standard
- Common: EUR, USD, GBP, JPY, CHF, CAD, AUD
- Validation: Use enum or regex `^[A-Z]{3}$`

## Implementation Steps

1. **Database:**
   - Add Transaction, Category, UserSettings models
   - Run migrations
   - Seed with default categories

2. **Backend:**
   - Exchange rate service (`packages/utils/src/exchange-rate.ts`)
   - Transaction API routes (CRUD)
   - Category API routes
   - Validation with Zod schemas

3. **Frontend:**
   - Transaction form (with currency selector)
   - Transaction list (with filters)
   - Category management
   - Summary cards (income/expense/balance)

4. **Testing:**
   - Unit tests for currency calculations
   - Test with multiple currencies
   - Test manual rate override
   - Test base currency change

## Risks & Mitigation

**Risk 1:** Exchange rate API downtime
- **Mitigation:** Allow manual rate entry, cache rates in Redis for 24h

**Risk 2:** Floating point precision errors
- **Mitigation:** Use Prisma Decimal type, never use JavaScript `Number` for money

**Risk 3:** Confused users entering wrong currency
- **Mitigation:** Show clear currency selector, remember last used currency

**Risk 4:** Performance with many transactions
- **Mitigation:** Pagination, indexed queries on (userId, date), pre-calculated totals

## Non-Functional Requirements
- **Performance:** List view < 200ms for 1000 transactions
- **Accuracy:** Currency calculations precise to 2 decimal places
- **UX:** Transaction creation < 5 seconds (including API call)
- **Maintainability:** Single source of truth for exchange rates

## Decision Record

**Decision:** Use hybrid storage (original + converted) with ExchangeRate-API for free tier.

**Alternatives considered:**
- Fixer.io (only 100 requests/month free)
- Currencylayer (requires API key)
- Manual entry only (too much user friction)

**Why chosen:**
- Free tier sufficient for personal use
- No API key required (simpler setup)
- Historical accuracy maintained
- Fast queries for reports
