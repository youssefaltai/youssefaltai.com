# Deployment Steps - Exchange Rate System

## Summary of Changes

Implemented a comprehensive exchange rate system to fix cross-currency calculation issues in the finance dashboard.

### What Was Fixed
1. ✅ Transaction summaries now correctly convert amounts to base currency
2. ✅ Account balances correctly aggregate across different currencies
3. ✅ Net worth calculations properly handle multi-currency portfolios
4. ✅ User-managed exchange rates with settings UI

### Files Modified
- **Database**: Added `ExchangeRate` model to Prisma schema
- **Backend**: Created `/api/exchange-rates` endpoints (GET, PUT)
- **Utilities**: Added currency conversion functions in `finance-utils.ts`
- **Frontend**: Created exchange rate manager component in settings
- **Calculations**: Updated all dashboard calculations to use exchange rates

## Required Steps Before Running

### 1. Database Migration

The schema has changed. You need to run a Prisma migration:

```bash
# Navigate to the db package
cd packages/db

# Create and apply the migration
pnpm prisma migrate dev --name add-exchange-rates

# Generate the Prisma client
pnpm prisma generate
```

### 2. Build the Project

```bash
# From the root directory
cd ../..

# Build all packages
pnpm build
```

### 3. Start the Development Server

```bash
# Start the finance app
pnpm --filter finance dev
```

## First-Time User Setup

When a user first logs in after this update:

1. They'll see the dashboard (may show incomplete totals if they have multi-currency data)
2. Navigate to **Profile/Settings** page
3. Scroll to **Exchange Rates** section
4. Set rates for currency pairs they use:
   - 1 USD = ? EGP (e.g., 50)
   - 1g Gold = ? EGP (e.g., 3500)
   - 1 USD = ? g Gold (e.g., 0.014)
5. Dashboard will immediately reflect correct totals

## Testing the Implementation

### Test 1: Set Exchange Rate

1. Go to Settings → Exchange Rates
2. Click "Set" next to "1 USD = ? EGP"
3. Enter "50" and click "Save"
4. Rate should be saved and displayed

### Test 2: Multi-Currency Dashboard

1. Create an account in USD (e.g., "Bank USD" with 100 USD)
2. Create an account in EGP (e.g., "Bank EGP" with 1,000 EGP)
3. Set exchange rate: 1 USD = 50 EGP
4. Go to Dashboard
5. Verify net worth shows: 6,000 EGP (100×50 + 1,000)

### Test 3: Multi-Currency Transactions

1. Create income transaction: 100 USD
2. Set exchange rate: 1 USD = 50 EGP  
3. Go to Dashboard
4. Verify income shows correct EGP equivalent

## Migration for Existing Data

If you have existing transactions in multiple currencies:

1. **Set your exchange rates first** (Settings → Exchange Rates)
2. Dashboard will automatically recalculate using new rates
3. No data migration needed - all existing data is preserved

## Rollback Plan

If you need to rollback:

```bash
cd packages/db
pnpm prisma migrate rollback
pnpm prisma generate
cd ../..
pnpm build
```

## Common Issues

### Issue: "Exchange rate not found"
**Solution**: Go to Settings and set the exchange rate for that currency pair

### Issue: Dashboard shows incomplete totals
**Solution**: Set all required exchange rates in Settings

### Issue: Prisma client errors
**Solution**: Run `pnpm prisma generate` in the packages/db directory

## Production Deployment

For production deployment:

```bash
# 1. Backup database
pg_dump DATABASE_URL > backup.sql

# 2. Run migration
cd packages/db
pnpm prisma migrate deploy
pnpm prisma generate

# 3. Build for production
cd ../..
pnpm build

# 4. Restart services
docker compose up -d --build finance
```

## Next Steps (Optional Enhancements)

1. **Auto-fetch rates**: Integrate with exchange rate API (e.g., exchangerate-api.com)
2. **Rate alerts**: Notify users when rates change significantly
3. **Rate history**: Track historical rates for trend analysis
4. **More currencies**: Add support for EUR, GBP, etc.

## Questions?

See the full audit report at: `docs/finance/CROSS-CURRENCY-AUDIT.md`

