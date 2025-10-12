# Finance App Documentation

This documentation describes the Finance app - a personal finance tracker built on **double-entry bookkeeping** principles with multi-currency support.

## Core Philosophy

The Finance app is built on three fundamental principles:

1. **Double-Entry Bookkeeping**: Every transaction moves money FROM one account TO another account. No money appears or disappears - it always flows between accounts.

2. **Account-Centric Design**: Everything is an account - not just bank accounts, but also income sources, expense categories, assets, liabilities, and equity. This provides a complete financial picture.

3. **Multi-Currency by Design**: Every account has a currency. Transactions can happen across currencies with proper exchange rate tracking for historical accuracy.

## Documentation Structure

- [Core Concepts](./core-concepts.md) - Understanding accounts and transactions
- [Multi-Currency System](./multi-currency.md) - How currency conversion works
- [Architecture](./architecture.md) - Code organization and patterns
- [API Reference](./api-reference.md) - Endpoints and usage

## Quick Start

The Finance app uses:
- **Database**: PostgreSQL with Prisma ORM
- **Auth**: WebAuthn (biometric authentication)
- **API**: Next.js App Router API routes
- **Validation**: Zod schemas at API boundary

Key models:
- `User` - User account with base currency preference
- `Account` - Financial account (asset, liability, income, expense, equity)
- `Transaction` - Money movement between two accounts
- `Credential` - WebAuthn credentials for authentication

## Key Terminology

| Term | Meaning |
|------|---------|
| **Account** | Any financial entity that holds or moves money (bank, wallet, income, expense, etc.) |
| **Transaction** | Movement of money FROM one account TO another account |
| **Base Currency** | User's primary currency (e.g., EGP) - used for reporting and calculations |
| **Exchange Rate** | Conversion rate stored at transaction time (historical accuracy) |
| **Opening Balance** | Initial money in an account, balanced by an "Opening Balances" equity account |
| **Double-Entry** | Accounting principle: every transaction affects exactly two accounts |

## Architecture at a Glance

```
apps/finance/src/
├── app/                    # Next.js App Router
│   ├── api/               # API routes (thin layer)
│   └── (app)/             # Pages (placeholder UI)
├── features/              # Business logic by feature
│   ├── accounts/         # Account creation, listing
│   └── transactions/     # Transaction CRUD operations
└── shared/               # Utilities and validators
    ├── account-validators.ts      # Security: ownership validation
    ├── finance-utils.ts           # Currency conversion logic
    └── validation-refinements.ts  # Zod refinements
```

**Key Pattern**: API routes are thin - they handle auth and pass to feature modules for business logic.

## Security Model

Every API request:
1. **Verifies authentication** (JWT token)
2. **Validates ownership** (user owns the accounts)
3. **Validates input** (Zod schemas)
4. **Executes business logic** (in feature modules)
5. **Returns standardized response**

See [Architecture](./architecture.md) for details.

## Status

✅ **Complete**: Backend API, authentication, multi-currency support  
🚧 **In Progress**: Frontend UI is placeholder - will be rebuilt after backend testing

## Next Steps

1. Read [Core Concepts](./core-concepts.md) to understand the double-entry system
2. Review [Multi-Currency System](./multi-currency.md) for currency handling
3. Check [Architecture](./architecture.md) for code organization
4. Use [API Reference](./api-reference.md) for implementation details

