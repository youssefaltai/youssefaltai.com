# Finance App Architecture

## 📐 Structure

This app follows a **feature-first architecture** with clear separation of concerns.

```
apps/finance/src/
├── app/                          # Next.js routing (thin wrappers)
│   ├── (app)/                   # Authenticated routes (with layout)
│   │   ├── layout.tsx          # Layout with BottomNav & container
│   │   ├── page.tsx            # Dashboard
│   │   ├── transactions/page.tsx
│   │   ├── budgets/page.tsx
│   │   ├── goals/page.tsx
│   │   └── profile/page.tsx
│   ├── api/                     # API routes (use @repo/auth/api-middleware)
│   │   ├── transactions/
│   │   ├── categories/
│   │   └── summary/
│   ├── login/page.tsx
│   ├── layout.tsx               # Root layout
│   ├── globals.css
│   ├── manifest.ts
│   └── providers.tsx
│
├── features/                     # Feature-first organization
│   ├── transactions/
│   │   ├── api/                 # Business logic
│   │   │   ├── get-transactions.ts
│   │   │   ├── create-transaction.ts
│   │   │   ├── update-transaction.ts
│   │   │   └── delete-transaction.ts
│   │   ├── hooks/               # Data fetching (TanStack Query)
│   │   │   ├── useTransactions.ts
│   │   │   ├── useCreateTransaction.ts
│   │   │   └── useDeleteTransaction.ts
│   │   ├── stores/              # UI state (Zustand)
│   │   │   └── useFilterStore.ts
│   │   └── validation.ts        # Zod schemas
│   │
│   ├── categories/
│   │   ├── api/
│   │   ├── hooks/
│   │   └── validation.ts
│   │
│   └── dashboard/
│       ├── api/
│       └── hooks/
│
└── middleware.ts
```

---

## 🎯 Architecture Principles

### 1. **Feature-First Organization**
- Each feature is **self-contained**
- All feature code lives in one place: API handlers, hooks, components, validation
- Easy to find: "Where's transaction validation?" → `features/transactions/validation.ts`

### 2. **Clear Layers**
1. **`app/` (Routing)**: Minimal Next.js routing logic
2. **`features/*/api/` (Business Logic)**: Database queries, business rules
3. **`features/*/hooks/` (Data Layer)**: TanStack Query for server state
4. **`features/*/components/` (UI)**: React components
5. **`app/(app)/*/page.tsx` (Pages)**: Compose hooks + components

### 3. **Separation of Concerns**
- **API routes** (`app/api/`) → Thin wrappers (auth + delegate to feature handlers)
- **Feature handlers** (`features/*/api/`) → Business logic
- **Hooks** (`features/*/hooks/`) → Data fetching & caching
- **Stores** (`features/*/stores/`) → UI state only
- **Validation** (`features/*/validation.ts`) → Zod schemas

---

## 📦 What Goes Where?

### **In `features/`** (Feature-Specific)
✅ Feature-specific validation schemas  
✅ Feature-specific API handlers  
✅ Feature-specific hooks  
✅ Feature-specific components  
✅ Feature-specific stores

### **In `app/(app)/layout.tsx`** (App Layout)
✅ Page container wrapper (`min-h-screen`, `max-w-lg`)  
✅ Bottom navigation (using `@repo/ui/BottomNav`)  
✅ Shared padding for bottom nav (`pb-20`)

### **In `@repo/`** (Monorepo-Wide)
✅ Used by 2+ apps  
✅ Generic utilities (date formatting, cn helper, PWA config)  
✅ Shared types (database models, API responses)  
✅ Shared UI components (Button, Card, Input)

---

## 🔄 Data Flow

```
User Action → Component
              ↓
        TanStack Query Hook (features/*/hooks/)
              ↓
        API Route (app/api/*/)
              ↓
        Feature Handler (features/*/api/)
              ↓
        Prisma → Database
```

---

## ✨ Benefits

1. ✅ **Scalable** - Add new features without touching others
2. ✅ **Maintainable** - Clear structure, easy to navigate
3. ✅ **Testable** - Test features in isolation
4. ✅ **Reusable** - Shared code in `shared/`, generic code in `@repo/`
5. ✅ **Type-Safe** - TypeScript + Zod validation
6. ✅ **Fast** - TanStack Query caching + Next.js optimizations

---

## 🚀 Adding a New Feature

1. Create feature directory: `features/my-feature/`
2. Add structure:
   ```
   features/my-feature/
   ├── api/                      # Business logic handlers
   │   ├── get-my-feature.ts
   │   └── create-my-feature.ts
   ├── hooks/                    # TanStack Query hooks
   │   ├── useMyFeature.ts
   │   └── useCreateMyFeature.ts
   ├── stores/                   # Zustand stores (if needed)
   │   └── useMyFeatureStore.ts
   └── validation.ts             # Zod schemas
   ```
   Note: Page components go in `app/(app)/my-feature/page.tsx`
3. Create API route: `app/api/my-feature/route.ts` (thin wrapper)
4. Create page: `app/(app)/my-feature/page.tsx`

---

## 📚 Related

- **State Management**: TanStack Query (server) + Zustand (UI)
- **Validation**: Zod schemas in `features/*/validation.ts`
- **Styling**: Tailwind CSS + Apple Design System (`@repo/ui`)
- **Testing**: (TODO: Add testing strategy)

