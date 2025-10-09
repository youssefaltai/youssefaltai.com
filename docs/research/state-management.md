# State Management & API Integration Research

**Date:** 2025-01-09  
**Problem:** Current Finance app uses ad-hoc `useState` + `useEffect` + `fetch`. Need robust, scalable solution for data fetching, caching, loading states, and offline support.

---

## Analysis of Current Approach

### Current Pattern (useState + useEffect + fetch):
```typescript
const [data, setData] = useState([])
const [loading, setLoading] = useState(false)
const [error, setError] = useState(null)

useEffect(() => {
  fetchData()
}, [])
```

### Problems:
❌ Manual loading/error state management  
❌ No caching - refetches on every mount  
❌ No request deduplication  
❌ Race conditions with multiple requests  
❌ No optimistic updates  
❌ No offline support  
❌ Boilerplate in every component  

---

## Candidate Solutions

### 1. **TanStack Query (React Query) v5** ⭐ RECOMMENDED

**What it is:** Industry-standard library for fetching, caching, and updating server state

**Pros:**
- ✅ Automatic caching & background refetching
- ✅ Built-in loading, error, success states
- ✅ Request deduplication
- ✅ Optimistic updates
- ✅ Automatic retry on failure
- ✅ DevTools for debugging
- ✅ TypeScript-first
- ✅ Works with Next.js App Router
- ✅ Offline support via persistence
- ✅ 13KB gzipped

**Cons:**
- Learning curve (moderate)
- Extra dependency

**Best for:** Server state (API data - transactions, budgets, summary)

**Installation:**
```bash
pnpm add @tanstack/react-query @tanstack/react-query-devtools
```

---

### 2. **Zustand**

**What it is:** Lightweight state management for client/UI state

**Pros:**
- ✅ Tiny bundle (1KB)
- ✅ Simple API
- ✅ No Provider hell
- ✅ TypeScript support
- ✅ Perfect for UI state

**Cons:**
- Not designed for server state
- Manual API integration

**Best for:** Client state (modals, filters, preferences)

**Installation:**
```bash
pnpm add zustand
```

---

### 3. **Next.js Server Actions**

**What it is:** Native Next.js solution for mutations

**Pros:**
- ✅ No API routes needed
- ✅ Server-first
- ✅ Built-in form handling

**Cons:**
- Still evolving
- Less flexible for complex UI
- Not ideal for real-time updates

**Best for:** Form submissions, simple mutations

---

### 4. **Context API** (Current lightweight approach)

**Pros:**
- Built into React
- Zero dependencies

**Cons:**
- ❌ All manual work
- ❌ Performance issues with frequent updates
- ❌ Not designed for async/API calls

**Best for:** Very simple global state only

---

## Recommended Architecture: **Hybrid Approach**

```
┌───────────────────────────────────────┐
│     TanStack Query                    │
│  (Server State - API Data)            │
│  - Transactions                       │
│  - Summary, Categories                │
│  - Budgets, Goals                     │
│  - Auto-caching & refetching          │
└───────────────────────────────────────┘
                ↓
┌───────────────────────────────────────┐
│     Zustand                           │
│  (Client State - UI)                  │
│  - Modal open/close states            │
│  - Filter selections                  │
│  - Search queries                     │
│  - Currency preference                │
└───────────────────────────────────────┘
                ↓
┌───────────────────────────────────────┐
│     useState                          │
│  (Component-Local State)              │
│  - Form inputs (controlled)           │
│  - Toggles, temporary UI              │
└───────────────────────────────────────┘
```

---

## Implementation Example

### Setup TanStack Query Provider

```typescript
// app/providers.tsx
'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { useState } from 'react'

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 1000 * 60 * 5, // 5 min
        retry: 2,
        refetchOnWindowFocus: true,
      },
    },
  }))

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  )
}
```

### Custom Hook for Transactions

```typescript
// hooks/useTransactions.ts
import { useQuery } from '@tanstack/react-query'

interface TransactionFilters {
  type?: 'income' | 'expense'
  limit?: number
}

export function useTransactions(filters?: TransactionFilters) {
  return useQuery({
    queryKey: ['transactions', filters], // Cache key
    queryFn: async () => {
      const params = new URLSearchParams()
      if (filters?.type) params.append('type', filters.type)
      if (filters?.limit) params.append('limit', String(filters.limit))
      
      const res = await fetch(`/api/transactions?${params}`)
      if (!res.ok) throw new Error('Failed to fetch')
      const data = await res.json()
      return data.data
    },
    staleTime: 1000 * 60 * 5,
  })
}

// Usage in component:
function TransactionsPage() {
  const { data, isLoading, error } = useTransactions({ type: 'expense' })
  
  if (isLoading) return <div>Loading...</div>
  if (error) return <div>Error: {error.message}</div>
  
  return <div>{data.map(...)}</div>
}
```

### Mutation with Auto-Refresh

```typescript
// hooks/useCreateTransaction.ts
import { useMutation, useQueryClient } from '@tanstack/react-query'

export function useCreateTransaction() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (newTransaction) => {
      const res = await fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTransaction),
      })
      if (!res.ok) throw new Error('Failed to create')
      return res.json()
    },
    onSuccess: () => {
      // Auto-invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['transactions'] })
      queryClient.invalidateQueries({ queryKey: ['summary'] })
    },
  })
}

// Usage:
const createTransaction = useCreateTransaction()

const handleSubmit = () => {
  createTransaction.mutate(formData, {
    onSuccess: () => {
      // Close modal, show toast, etc.
    },
  })
}
```

### Zustand for UI State

```typescript
// stores/useModalStore.ts
import { create } from 'zustand'

interface ModalStore {
  showAddTransaction: boolean
  showCategories: boolean
  openAddTransaction: () => void
  closeAddTransaction: () => void
  openCategories: () => void
  closeCategories: () => void
}

export const useModalStore = create<ModalStore>((set) => ({
  showAddTransaction: false,
  showCategories: false,
  openAddTransaction: () => set({ showAddTransaction: true }),
  closeAddTransaction: () => set({ showAddTransaction: false }),
  openCategories: () => set({ showCategories: true }),
  closeCategories: () => set({ showCategories: false }),
}))

// Usage:
const { showAddTransaction, openAddTransaction, closeAddTransaction } = useModalStore()
```

---

## Benefits for Finance App

| Feature | Current | With TanStack Query |
|---------|---------|---------------------|
| Caching | ❌ None | ✅ Automatic |
| Loading states | 🟡 Manual | ✅ Built-in |
| Error handling | 🟡 Manual | ✅ Built-in |
| Refetching | ❌ On every mount | ✅ Smart background |
| Optimistic updates | ❌ None | ✅ Easy to implement |
| Offline support | ❌ None | ✅ With persistence |
| DevTools | ❌ None | ✅ Full debugging |
| Type safety | 🟡 Partial | ✅ Full TypeScript |
| Code reduction | - | ✅ 50-70% less code |

---

## Bundle Size Impact

| Library | Size (gzipped) | Justified? |
|---------|----------------|------------|
| TanStack Query | 13 KB | ✅ YES |
| Zustand | 1 KB | ✅ YES |
| **Total** | **14 KB** | ✅ Excellent ROI |

**Comparison:** We're already using 125 KB for shared JS. Adding 14 KB (11% increase) for dramatically better DX and UX is worth it.

---

## Migration Plan

### Phase 1: Setup (30 min)
1. Install dependencies
2. Add Providers to root layout
3. Set up DevTools

### Phase 2: Migrate One Feature (1-2 hours)
1. Create `useTransactions` hook
2. Replace useState/useEffect in Home page
3. Test and measure improvement

### Phase 3: Add Mutations (1 hour)
1. Create `useCreateTransaction`
2. Auto-invalidate related queries
3. Add optimistic updates

### Phase 4: Migrate Remaining Features (2-3 hours)
1. Summary, Categories, Budgets, Goals
2. Consistent patterns across all screens

### Phase 5: Add Zustand for UI (1 hour)
1. Extract modal states
2. Extract filter states
3. Clean up component code

### Phase 6: Offline Support (Future)
1. Add persistence plugin
2. Test offline scenarios
3. Sync on reconnection

**Total time:** ~6-8 hours for complete migration

---

## Decision

**RECOMMENDED:** Proceed with TanStack Query + Zustand

**Reasons:**
1. ✅ Industry standard (used by Vercel, Netflix, Meta)
2. ✅ Dramatic code reduction (50-70% less boilerplate)
3. ✅ Better UX (automatic caching, optimistic updates)
4. ✅ Better DX (DevTools, TypeScript support)
5. ✅ Scalable (works for 10 or 10,000 components)
6. ✅ Small bundle impact (14 KB for huge benefits)
7. ✅ Aligns with project goals (PWA, offline, performance)

**Next Step:** Get approval and start Phase 1 implementation

---

## References

- [TanStack Query Docs](https://tanstack.com/query/latest/docs/framework/react/overview)
- [TanStack Query + Next.js](https://tanstack.com/query/latest/docs/framework/react/guides/advanced-ssr)
- [Zustand Docs](https://zustand-demo.pmnd.rs/)
- [State Management Best Practices 2025](https://react.dev/learn/managing-state)
