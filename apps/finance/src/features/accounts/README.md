# Accounts Feature - Organized Structure

This directory contains the accounts feature organized by account type, with maximum reusability and clear separation of concerns.

## Directory Structure

```
accounts/
├── shared/                      # Shared utilities and validation
│   ├── validation.ts           # Base schemas (create/update)
│   └── account-helpers.ts      # Reusable helper functions
│
├── asset/                       # Asset accounts (bank, cash, savings)
│   ├── validation.ts           # Asset-specific schemas
│   ├── create.ts               # Create asset account
│   ├── get-all.ts              # Get all asset accounts
│   ├── get.ts                  # Get single asset account
│   ├── update.ts               # Update asset account
│   ├── delete.ts               # Delete asset account
│   └── index.ts                # Clean exports
│
├── goal/                        # Goals (all CRUD operations)
│   ├── validation.ts
│   ├── create.ts, get-all.ts, get.ts, update.ts, delete.ts
│   └── index.ts
│
├── loan/                        # Loans (all CRUD operations)
│   ├── validation.ts
│   ├── create.ts, get-all.ts, get.ts, update.ts, delete.ts
│   └── index.ts
│
├── credit-card/                 # Credit cards (all CRUD operations)
│   ├── validation.ts
│   ├── create.ts, get-all.ts, get.ts, update.ts, delete.ts
│   └── index.ts
│
├── income/                      # Income sources (all CRUD operations)
│   ├── validation.ts
│   ├── create.ts, get-all.ts, get.ts, update.ts, delete.ts
│   └── index.ts
│
└── expense/                     # Expense categories (all CRUD operations)
    ├── validation.ts
    ├── create.ts, get-all.ts, get.ts, update.ts, delete.ts
    └── index.ts
```

## Design Principles

### 1. **Organization by Type**
Each account type has its own folder containing all its related logic:
- Validation schemas
- Create function
- Update function  
- Index file for clean exports

### 2. **Maximum Reusability**
Shared logic is centralized in the `shared/` folder:
- **Base schemas**: Common fields (name, description, currency, opening balance)
- **Helper functions**: 
  - `createAccountWithOpeningBalance()` - Used by all create functions
  - `updateAccountFields()` - Used by all update functions

### 3. **Type-Specific Validation**
Each account type extends base schemas with its unique fields:
- **Asset**: Base schema (no extra fields)
- **Goal**: Base + target + dueDate
- **Loan**: Base + dueDate
- **Credit Card**: Base schema
- **Income**: Base schema
- **Expense**: Base schema

### 4. **No Type Routing**
Each account type has its own complete CRUD functions - no type detection or routing logic:
```typescript
// Direct, explicit imports
import { createAssetAccount, getAssetAccount, updateAssetAccount, deleteAssetAccount } from "@/features/accounts/asset"
import { createGoal, getGoal, updateGoal, deleteGoal } from "@/features/accounts/goal"
import { createLoan, getLoan, updateLoan, deleteLoan } from "@/features/accounts/loan"
```

**No routing logic**: API routes call type-specific functions directly, no need to detect account type.

## Usage Examples

### Creating an Account

```typescript
// Asset account
import { createAssetAccount } from "@/features/accounts/asset"
const account = await createAssetAccount(userId, {
    name: "Cash Wallet",
    currency: "EGP",
    openingBalance: 1000
})

// Goal
import { createGoal } from "@/features/accounts/goal"
const goal = await createGoal(userId, {
    name: "Emergency Fund",
    currency: "EGP",
    target: 50000,
    dueDate: "2025-12-31T23:59:59.000Z",
    openingBalance: 10000
})
```

### Updating an Account

```typescript
// Update goal
import { updateGoal } from "@/features/accounts/goal"
const updated = await updateGoal(accountId, userId, {
    target: 60000,
    dueDate: "2026-12-31T23:59:59.000Z"
})

// Update asset account
import { updateAssetAccount } from "@/features/accounts/asset"
const updated = await updateAssetAccount(accountId, userId, {
    name: "Updated Name",
    currency: "USD"
})
```

### Getting/Deleting Accounts

```typescript
// Get all assets
import { getAllAssetAccounts } from "@/features/accounts/asset"
const assets = await getAllAssetAccounts(userId)

// Get all goals
import { getAllGoals } from "@/features/accounts/goal"
const goals = await getAllGoals(userId)

// Get single asset account
import { getAssetAccount } from "@/features/accounts/asset"
const account = await getAssetAccount(accountId, userId)

// Get single goal
import { getGoal } from "@/features/accounts/goal"
const goal = await getGoal(accountId, userId)

// Delete asset account
import { deleteAssetAccount } from "@/features/accounts/asset"
await deleteAssetAccount(accountId, userId)

// Delete goal
import { deleteGoal } from "@/features/accounts/goal"
await deleteGoal(accountId, userId)
```

## Shared Helpers

### `createAccountWithOpeningBalance()`
**Used by**: All create functions

**Features**:
- Handles opening balance creation
- Cross-currency validation and conversion
- Atomic database transactions
- Proper error handling
- Structured logging

**Benefits**:
- Single source of truth for account creation logic
- Consistent behavior across all account types
- Easy to maintain and test

### `updateAccountFields()`
**Used by**: All update functions

**Features**:
- Generic field update logic
- Ownership validation
- Proper omit fields handling

**Benefits**:
- Reduces code duplication
- Consistent update behavior
- Type-safe with proper omit fields

## Validation Pattern

### Base Schema (Shared)
```typescript
// shared/validation.ts
export const baseCreateAccountSchema = z.object({
    name: z.string().min(1),
    description: z.string().optional(),
    currency: z.enum(Currency),
    openingBalance: z.number().positive().optional(),
    openingBalanceExchangeRate: z.number().positive().optional(),
})
```

### Type-Specific Extension
```typescript
// goal/validation.ts
export const createGoalSchema = baseCreateAccountSchema.extend({
    target: z.number().positive(),
    dueDate: z.iso.datetime(),
})
```

This pattern:
- ✅ Maximizes reusability
- ✅ Maintains type safety
- ✅ Keeps validation DRY
- ✅ Easy to extend for new types

## Benefits of This Structure

### 1. **Maintainability**
- Each account type is self-contained
- Easy to find and modify type-specific logic
- Clear separation of concerns

### 2. **Scalability**
- Adding a new account type is straightforward:
  1. Create new folder
  2. Add validation (extend base schema)
  3. Add create/update functions
  4. Export from index
- No need to modify existing code

### 3. **Testability**
- Each type can be tested independently
- Shared helpers can be tested once
- Clear interfaces for mocking

### 4. **Readability**
- File names match their purpose
- Clear hierarchy and organization
- Easy for new developers to understand

### 5. **Reusability**
- Base schemas prevent duplication
- Helper functions eliminate repetitive code
- Clean exports make imports simple

## Key Differences from Typical Approaches

### No Type Routing ✅
Unlike many implementations that use a single endpoint with type detection:
```typescript
// ❌ Typical approach (with routing)
PATCH /api/accounts/:id → updateAccount() → detects type → routes to correct function

// ✅ Our approach (direct)
PATCH /api/goals/:id → updateGoal() (no type detection needed)
```

### Benefits of Direct Approach:
1. **Explicit** - Clear which endpoint does what
2. **Type-safe** - No casting or type detection logic
3. **Simple** - Straightforward request → function mapping
4. **Debuggable** - Easy to trace issues
5. **RESTful** - Each resource type has its own URL namespace

## API Routes Integration

Each account type has its own set of dedicated endpoints with direct function calls:

```typescript
// Asset Accounts
POST   /api/accounts       → createAssetAccount()
GET    /api/accounts       → getAllAssetAccounts()
GET    /api/accounts/:id   → getAssetAccount()
PATCH  /api/accounts/:id   → updateAssetAccount()
DELETE /api/accounts/:id   → deleteAssetAccount()

// Goals
POST   /api/goals          → createGoal()
GET    /api/goals          → getAllGoals()
GET    /api/goals/:id      → getGoal()
PATCH  /api/goals/:id      → updateGoal()
DELETE /api/goals/:id      → deleteGoal()

// Loans
POST   /api/loans          → createLoan()
GET    /api/loans          → getAllLoans()
GET    /api/loans/:id      → getLoan()
PATCH  /api/loans/:id      → updateLoan()
DELETE /api/loans/:id      → deleteLoan()

// Credit Cards
POST   /api/credit-cards       → createCreditCard()
GET    /api/credit-cards       → getAllCreditCards()
GET    /api/credit-cards/:id   → getCreditCard()
PATCH  /api/credit-cards/:id   → updateCreditCard()
DELETE /api/credit-cards/:id   → deleteCreditCard()

// Income
POST   /api/income         → createIncomeSource()
GET    /api/income         → getAllIncomeSources()
GET    /api/income/:id     → getIncomeSource()
PATCH  /api/income/:id     → updateIncomeSource()
DELETE /api/income/:id     → deleteIncomeSource()

// Expense
POST   /api/expense        → createExpenseCategory()
GET    /api/expense        → getAllExpenseCategories()
GET    /api/expense/:id    → getExpenseCategory()
PATCH  /api/expense/:id    → updateExpenseCategory()
DELETE /api/expense/:id    → deleteExpenseCategory()
```

**Complete separation** - each account type has:
- Its own URL namespace
- Its own complete CRUD operations
- Direct function calls (no routing logic)
- Type-specific validation and responses

## Summary

This organization provides:
- ✅ **Clear structure** - Each type in its own folder
- ✅ **Maximum reusability** - Shared helpers and base schemas
- ✅ **Type safety** - Proper TypeScript types throughout
- ✅ **Maintainability** - Easy to find and modify code
- ✅ **Scalability** - Simple to add new account types
- ✅ **Clean imports** - Well-organized exports
- ✅ **Zero duplication** - Shared logic centralized

The new structure maintains all functionality while providing a much cleaner and more maintainable codebase.

