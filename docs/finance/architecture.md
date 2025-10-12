# Architecture

This document explains how the Finance app is organized and the patterns used throughout.

## Directory Structure

```
apps/finance/src/
├── app/                           # Next.js App Router
│   ├── api/                      # API routes (thin layer)
│   │   ├── accounts/route.ts     # GET, POST /api/accounts
│   │   └── transactions/
│   │       ├── route.ts          # GET, POST /api/transactions
│   │       └── [id]/route.ts     # PUT, DELETE /api/transactions/:id
│   ├── (app)/                    # Protected pages
│   │   ├── layout.tsx            # App layout with nav
│   │   ├── page.tsx              # Dashboard (placeholder)
│   │   ├── transactions/         # Transactions page
│   │   ├── budgets/              # Budgets page
│   │   └── profile/              # Profile page
│   ├── login/page.tsx            # Login page
│   └── manifest.ts               # PWA manifest
│
├── features/                      # Business logic (by feature)
│   ├── accounts/
│   │   ├── asset/                   # Asset accounts
│   │   │   ├── create.ts
│   │   │   ├── get.ts
│   │   │   ├── update.ts
│   │   │   ├── delete.ts
│   │   │   └── validation.ts
│   │   ├── goal/                    # Goals (similar structure)
│   │   ├── loan/                    # Loans (similar structure)
│   │   ├── credit-card/             # Credit cards
│   │   ├── income/                  # Income sources
│   │   ├── expense/                 # Expense categories
│   │   ├── shared/                  # Shared validation & helpers
│   │   └── get-accounts.ts          # Get all accounts
│   └── transactions/
│       ├── api/
│       │   ├── create-transaction.ts  # Transaction creation
│       │   ├── get-transactions.ts    # Fetch transactions
│       │   ├── update-transaction.ts  # Update transaction
│       │   └── delete-transaction.ts  # Delete transaction
│       └── validation.ts              # Transaction Zod schemas
│
├── shared/                        # Shared utilities
│   ├── account-validators.ts      # Security: ownership checks
│   ├── finance-utils.ts           # Currency conversion logic
│   ├── validation-refinements.ts  # Reusable Zod refinements
│   ├── omit-fields.ts             # Fields to omit in queries
│   ├── components/                # Shared components
│   └── utils/
│       └── api.ts                 # API response helpers
│
└── middleware.ts                  # Auth middleware
```

## Architectural Patterns

### 1. Thin API Routes

API routes (`app/api/**/*.ts`) are kept minimal - they only handle:
- Authentication verification
- Input parsing
- Calling feature modules
- Response formatting

```typescript
// apps/finance/src/app/api/transactions/route.ts
export async function POST(request: NextRequest) {
  // 1. Verify auth
  const { authenticated, userId } = await verifyAuth(request)
  if (!authenticated) return UnauthorizedResponse(userId)

  // 2. Parse input
  const jsonInput = await getJsonInput(request)
  if (!jsonInput) return BadRequestResponse(jsonInput)

  // 3. Call business logic
  const response = await createTransaction(userId, jsonInput)

  // 4. Return response
  return SuccessResponse(response)
}
```

**Why?** Keeps API routes easy to test and maintain. Business logic lives in features, not routes.

### 2. Feature Modules by Type

Business logic is organized by feature, with accounts further organized by type:

```
features/
├── accounts/
│   ├── asset/           # Complete CRUD for assets
│   │   ├── create.ts
│   │   ├── get.ts
│   │   ├── update.ts
│   │   ├── delete.ts
│   │   └── validation.ts
│   ├── goal/            # Complete CRUD for goals
│   ├── loan/            # Complete CRUD for loans
│   ├── credit-card/     # Complete CRUD for credit cards
│   ├── income/          # Complete CRUD for income
│   ├── expense/         # Complete CRUD for expense
│   ├── shared/          # Shared validation & helpers
│   │   ├── validation.ts         # Base schemas
│   │   └── account-helpers.ts    # Reusable functions
│   └── get-accounts.ts  # Get all (cross-type)
└── transactions/
    ├── api/             # Pure functions for transaction operations
    └── validation.ts    # Zod schemas for transactions
```

Each type module contains complete CRUD operations:
- **No routing logic** - Direct function calls
- **Type-specific validation** - Only relevant fields
- **Proper omit fields** - Returns appropriate data
- **Maximum reusability** - Shared helpers in `shared/`

**Benefits**:
- Direct, explicit function calls (no type detection)
- Each type is self-contained and independent
- Easy to add new account types
- Clear separation by business domain

### 3. Direct Function Calls (No Routing)

Each account type has dedicated endpoints that call type-specific functions directly:

```typescript
// API Route
POST /api/goals
  ↓
import { createGoal } from "@/features/accounts/goal"
  ↓
createGoal(userId, input) // Direct call, no type detection
```

**No Routing Logic**:
- ❌ No `switch (accountType)` statements
- ❌ No type detection from database
- ❌ No conditional logic based on account properties
- ✅ Direct imports and function calls

**Benefits**:
- Explicit and easy to trace
- Type-safe (TypeScript knows exact type)
- Simple debugging (no indirection)
- RESTful design (resource types have own URLs)

### 4. Security-First Design

Every operation validates ownership:

```typescript
// Validate user owns these accounts
const accountMap = await validateAccountsOwnership(
  [fromAccountId, toAccountId],
  userId
)
```

**Pattern**:
1. API route verifies authentication
2. Feature module validates authorization (ownership)
3. Only then does business logic execute

**Never trust client-provided IDs** - always verify the user owns the resources.

### 5. Validation Layers

Three validation layers:

#### Layer 1: Type Safety (TypeScript)
```typescript
// Compile-time type checking
function createTransaction(userId: string, input: CreateTransactionSchema)
```

#### Layer 2: Schema Validation (Zod)
```typescript
// Runtime validation at API boundary
const validated = createTransactionSchema.parse(input)
```

#### Layer 3: Business Rules (Feature Modules)
```typescript
// Domain-specific validation
validateAccountsOwnership(accountIds, userId)
calculateCurrencyConversion(...)  // Validates exchange rate requirements
```

### 6. Database Transaction Pattern

Use Prisma transactions for multi-step operations:

```typescript
const result = await prisma.$transaction(async (tx) => {
  // 1. Create transaction record
  const transaction = await tx.transaction.create({ ... })

  // 2. Update FROM account balance
  await tx.account.update({
    where: { id: fromAccountId },
    data: { balance: { decrement: amountToDeduct } }
  })

  // 3. Update TO account balance
  await tx.account.update({
    where: { id: toAccountId },
    data: { balance: { increment: amountToIncrement } }
  })

  return transaction
})
```

**Why?** Ensures atomicity - all steps succeed or all fail. No partial updates.

### 7. Omit Pattern for Security

Use Prisma's `omit` feature to hide sensitive fields:

```typescript
// shared/omit-fields.ts
export const TRANSACTION_OMIT_FIELDS = {
  deletedAt: true,
  updatedAt: true,
} as const

// In query
await prisma.transaction.findMany({
  omit: TRANSACTION_OMIT_FIELDS,
})
```

**Prevents** accidentally exposing soft-delete flags or internal timestamps.

## Key Modules

### `finance-utils.ts`

Core currency conversion logic:

```typescript
// Calculate amounts for transaction
calculateCurrencyConversion({
  amount,
  fromCurrency,
  toCurrency,
  providedCurrency?,
  providedExchangeRate?,
})

// Reverse transaction (for delete/update)
reverseCurrencyConversion(
  amount,
  currency,
  fromCurrency,
  toCurrency,
  exchangeRate
)
```

**Used by**: All transaction operations (create, update, delete)

### `account-validators.ts`

Security validation functions:

```typescript
// Validate user owns accounts
await validateAccountsOwnership(accountIds, userId)

// Get/create Opening Balances equity account
await getOrCreateOpeningBalancesAccount(userId, baseCurrency)

// Validate accounts are different
validateDifferentAccounts(fromAccountId, toAccountId)
```

**Used by**: All operations involving accounts

### `validation-refinements.ts`

Reusable Zod refinements:

```typescript
// Ensure FROM and TO accounts are different
differentAccountsRefinement(onlyIfBothProvided)

// Ensure currency provided when exchange rate is
currencyRequiredWithExchangeRateRefinement()
```

**Used by**: Transaction validation schemas

## Data Flow

### Creating a Transaction

```
1. User → POST /api/transactions
   ↓
2. API Route → verifyAuth()
   ↓
3. API Route → getJsonInput()
   ↓
4. API Route → createTransaction(userId, input)
   ↓
5. Feature Module → createTransactionSchema.parse(input)
   ↓
6. Feature Module → validateAccountsOwnership(accountIds, userId)
   ↓
7. Feature Module → calculateCurrencyConversion(...)
   ↓
8. Feature Module → prisma.$transaction(...)
   ├── Create transaction record
   ├── Update FROM account balance
   └── Update TO account balance
   ↓
9. Feature Module → Return transaction
   ↓
10. API Route → SuccessResponse(transaction)
    ↓
11. User ← { data: transaction }
```

### Updating a Transaction

```
1. User → PUT /api/transactions/:id
   ↓
2. API Route → verifyAuth()
   ↓
3. Feature Module → Fetch existing transaction (validate ownership)
   ↓
4. Feature Module → Reverse old transaction (restore balances)
   ↓
5. Feature Module → Apply new transaction (update balances)
   ↓
6. Feature Module → Update transaction record
   ↓
7. User ← { data: updatedTransaction }
```

### Deleting a Transaction

```
1. User → DELETE /api/transactions/:id
   ↓
2. API Route → verifyAuth()
   ↓
3. Feature Module → Fetch transaction (validate ownership)
   ↓
4. Feature Module → Reverse transaction (restore balances)
   ↓
5. Feature Module → Soft delete transaction (set deletedAt)
   ↓
6. User ← { data: { message: "deleted" } }
```

## Error Handling

### Pattern: Try-Catch at API Routes

```typescript
export async function POST(request: NextRequest) {
  try {
    const { authenticated, userId } = await verifyAuth(request)
    if (!authenticated) return UnauthorizedResponse(userId)

    const jsonInput = await getJsonInput(request)
    if (!jsonInput) return BadRequestResponse(jsonInput)

    const response = await createTransaction(userId, jsonInput)
    return SuccessResponse(response)
  } catch (error) {
    console.error('Error in POST /api/transactions:', error)
    return NextResponse.json(
      { message: 'Failed to create transaction' },
      { status: 500 }
    )
  }
}
```

### Pattern: Throw Descriptive Errors in Features

```typescript
// Bad
throw new Error('Invalid')

// Good
throw new Error('Currency is required for cross-currency transactions')
```

Feature modules throw descriptive errors that can be:
- Logged server-side (with context)
- Sanitized for client responses
- Used for debugging

## Logging Strategy

Structured logging at key points:

```typescript
console.log('Creating transaction:', {
  userId,
  fromAccountId,
  toAccountId,
  amount,
  currency,
  crossCurrency: fromCurrency !== toCurrency,
})

console.error('Invalid or unauthorized accounts:', {
  userId,
  missingIds,
})
```

**What to log**:
- Request context (userId, resource IDs)
- Business-critical operations
- Errors with context
- Cross-currency warnings

**What NOT to log**:
- Sensitive data (credentials, full tokens)
- User PII (emails, names) unless necessary
- Redundant info (logged elsewhere)

## Testing Strategy

### Unit Tests (Future)

Test feature modules independently:

```typescript
describe('createTransaction', () => {
  it('should create same-currency transaction', async () => {
    const result = await createTransaction(userId, {
      fromAccountId: 'bank',
      toAccountId: 'groceries',
      amount: 100,
      currency: Currency.EGP,
    })
    expect(result.amount).toBe(100)
    expect(result.exchangeRate).toBeNull()
  })
})
```

### Integration Tests (Future)

Test API routes end-to-end:

```typescript
describe('POST /api/transactions', () => {
  it('should create transaction for authenticated user', async () => {
    const response = await POST(mockRequest)
    expect(response.status).toBe(200)
  })
})
```

## Performance Considerations

### Database Indexes

```prisma
model Transaction {
  @@index([fromAccountId])
  @@index([toAccountId])
  @@index([userId])
}
```

Indexes on foreign keys ensure fast queries.

### Query Optimization

```typescript
// Bad: Fetch all fields
const accounts = await prisma.account.findMany()

// Good: Select only needed fields
const accounts = await prisma.account.findMany({
  select: { id: true, name: true, balance: true }
})
```

### Pagination (Future)

For large datasets, add pagination:

```typescript
const transactions = await prisma.transaction.findMany({
  where: { userId },
  take: 50,
  skip: page * 50,
  orderBy: { date: 'desc' },
})
```

## Security Checklist

- ✅ JWT verification on every API request
- ✅ User ownership validation for all resources
- ✅ Zod validation at API boundary
- ✅ Soft delete (preserves audit trail)
- ✅ No sensitive fields exposed (use `omit`)
- ✅ Database transactions for atomicity
- ✅ No raw errors exposed to client
- ✅ Structured logging (no PII)

## Dependency Injection Pattern

The app uses **implicit DI** through imports:

```typescript
// Feature modules import from shared
import { validateAccountsOwnership } from '@/shared/account-validators'
import { calculateCurrencyConversion } from '@/shared/finance-utils'

// API routes import from features
import createTransaction from '@/features/transactions/api/create-transaction'
```

**Future**: Could use explicit DI container for testability.

## Code Standards

### Naming Conventions

- **Files**: `kebab-case.ts` (e.g., `create-transaction.ts`)
- **Functions**: `camelCase` (e.g., `createTransaction`)
- **Types**: `PascalCase` (e.g., `CreateTransactionSchema`)
- **Constants**: `UPPER_SNAKE_CASE` (e.g., `TRANSACTION_OMIT_FIELDS`)

### Function Signatures

```typescript
// Feature module functions
export default async function featureName(
  userId: string,
  input: SchemaType
): Promise<ReturnType> {
  // ...
}
```

- Always accept `userId` as first parameter
- Accept validated input (typed by Zod schema)
- Return domain objects (not HTTP responses)
- Use `async/await` (no callbacks)

### Import Organization

```typescript
// 1. Next.js / React
import { NextRequest, NextResponse } from "next/server"

// 2. External packages
import { z } from "zod"

// 3. Workspace packages
import { prisma, TTransaction } from "@repo/db"
import { verifyAuth } from "@repo/auth"

// 4. Internal (relative imports)
import { createTransactionSchema } from "../validation"
import { validateAccountsOwnership } from "@/shared/account-validators"
```

## Next Steps

- Read [API Reference](./api-reference.md) for endpoint documentation
- Review [Core Concepts](./core-concepts.md) for business logic
- Check [Multi-Currency System](./multi-currency.md) for currency handling

