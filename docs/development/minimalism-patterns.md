# Minimalism Patterns

This document describes the minimalism patterns and shared utilities used throughout the codebase to eliminate redundancy and maintain consistency.

## Table of Contents
- [Forms](#forms)
- [Hooks](#hooks)
- [API Routes](#api-routes)
- [Components](#components)

## Forms

### Shared Utilities

#### CurrencySelect Component
Location: `packages/ui/src/components/CurrencySelect.tsx`

Generic currency selector that accepts currency options as props.

```tsx
import { CurrencySelect } from '@repo/ui'
import { CURRENCY_OPTIONS } from '@/utils/currencies'

<CurrencySelect
  {...register('currency')}
  currencies={CURRENCY_OPTIONS}
  error={errors.currency?.message}
  required
/>
```

#### useFormState Hook
Location: `apps/finance/src/hooks/use-form-state.ts`

Extracts common form state management: error handling and submission logic.

```tsx
import { useFormState } from '@/hooks/use-form-state'

const { submitError, handleSubmit: handleFormSubmit } = useFormState({
  onSubmit,
})

const onFormSubmit = async (data: CreateSchema) => {
  const cleanedData = cleanFormData(data)
  await handleFormSubmit(cleanedData, 'Failed to save resource')
}
```

#### FormActions Component
Location: `apps/finance/src/components/shared/FormActions.tsx`

Reusable form action buttons (Cancel/Submit).

```tsx
import { FormActions } from '@/components/shared/FormActions'

<FormActions
  onCancel={onCancel}
  isSubmitting={isSubmitting}
  submitLabel={initialData ? 'Update' : 'Create'}
/>
```

### Standard Form Pattern

```tsx
'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Input, CurrencySelect, Textarea } from '@repo/ui'
import { FormActions } from '@/components/shared/FormActions'
import { cleanFormData } from '@/utils/form'
import { CURRENCY_OPTIONS } from '@/utils/currencies'
import { useFormState } from '@/hooks/use-form-state'

export function MyForm({ initialData, onSubmit, onCancel }) {
  const { submitError, handleSubmit: handleFormSubmit } = useFormState({
    onSubmit,
  })

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(mySchema),
    defaultValues: { ...initialData }
  })

  const onFormSubmit = async (data) => {
    const cleanedData = cleanFormData(data)
    await handleFormSubmit(cleanedData, 'Failed to save')
  }

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
      {/* Form fields */}
      
      {submitError && (
        <p className="text-ios-footnote text-ios-red">{submitError}</p>
      )}

      <FormActions
        onCancel={onCancel}
        isSubmitting={isSubmitting}
        submitLabel={initialData ? 'Update' : 'Create'}
      />
    </form>
  )
}
```

## Hooks

### CRUD Hooks Factory
Location: `apps/finance/src/hooks/create-crud-hooks.ts`

Generic factory for creating CRUD hooks for any resource.

#### Usage

```tsx
import type { Account } from '@repo/db'
import { createCrudHooks } from '@/hooks/create-crud-hooks'

const { useItems, useCreateItem, useUpdateItem, useDeleteItem } = createCrudHooks<Account>({
  endpoint: '/api/assets',
  queryKey: 'assets',
  resourceName: 'asset',
})

export const useAssets = useItems
export const useCreateAsset = useCreateItem
export const useUpdateAsset = useUpdateItem
export const useDeleteAsset = useDeleteItem
```

#### Generated Functions

- `useItems()` - Fetches all items for the current user
- `useCreateItem()` - Creates a new item
- `useUpdateItem()` - Updates an existing item
- `useDeleteItem()` - Deletes an item

All hooks automatically:
- Handle loading and error states
- Invalidate relevant query caches on success
- Provide consistent error messages
- Follow React Query best practices

## API Routes

### Route Handlers Factory
Location: `apps/finance/src/shared/utils/api.ts`

Generic factory for creating account-type API route handlers.

#### Usage

```tsx
import { TAccount } from "@repo/db"
import { createAccountRouteHandlers } from "@/shared/utils/api"
import { createAsset, getAllAssets } from "@/features/accounts/asset"

export const { POST, GET } = createAccountRouteHandlers<TAccount>({
  createFn: createAsset,
  getAllFn: getAllAssets,
})
```

#### Generated Handlers

- `POST` - Creates a new resource
  - Verifies authentication
  - Validates input
  - Calls create function
  - Returns consistent response format

- `GET` - Fetches all resources
  - Verifies authentication
  - Calls get all function
  - Returns consistent response format

All handlers automatically:
- Handle auth verification
- Provide consistent error responses
- Log errors with context
- Follow API response standards

## Components

### Shared Components

#### EntityListItem
Location: `apps/finance/src/components/shared/EntityListItem.tsx`

Reusable list item component for displaying account-like entities.

```tsx
import { EntityListItem } from '@/components/shared/EntityListItem'
import { Wallet } from '@repo/ui'

<EntityListItem
  icon={Wallet}
  iconColor="neutral"
  title={account.name}
  subtitle={account.description}
  rightContent={<Amount value={balance} />}
  onClick={handleClick}
  isFirst={isFirst}
  isLast={isLast}
/>
```

### Card Components

Card components use shared utilities where appropriate but maintain custom implementations for unique requirements:

- `AssetCard` - Uses `EntityListItem`
- `LoanCard` - Uses `EntityListItem` with due date
- `GoalCard` - Custom implementation (needs progress tracking)

## Benefits of These Patterns

1. **DRY Principle** - Single source of truth for common patterns
2. **Consistency** - Same patterns across the entire app
3. **Maintainability** - Bug fixes apply everywhere
4. **Type Safety** - Generic factories maintain TypeScript strictness
5. **Faster Development** - New features require minimal boilerplate

## Adding New Account Types

To add a new account type, you only need:

1. **Feature folder** (~50 lines)
   - create.ts, update.ts, delete.ts, get-all.ts
   - validation.ts

2. **Hooks** (~18 lines)
   ```tsx
   const { useItems, useCreateItem, ... } = createCrudHooks<Account>({
     endpoint: '/api/my-resource',
     queryKey: 'my-resource',
     resourceName: 'my resource',
   })
   ```

3. **API Route** (~12 lines)
   ```tsx
   export const { POST, GET } = createAccountRouteHandlers<TAccount>({
     createFn: createMyResource,
     getAllFn: getAllMyResources,
   })
   ```

4. **Form Component** (~80 lines)
   - Use useFormState, CurrencySelect, FormActions
   - Follow standard form pattern

**Total: ~160 lines instead of ~300 lines** (47% reduction)

