# Development Standards & Best Practices

> **Project**: youssefaltai.com Monorepo  
> **Stack**: Next.js 15, TypeScript, Turborepo, Docker, Prisma  
> **Last Updated**: October 2024

This document summarizes the coding standards enforced via `.cursor/rules/` files.

---

## 📋 **Active Rules**

### **01 - Minimalism**
Add only what's necessary. Every dependency/abstraction must justify its existence.

### **02 - Tooling First**
Use CLIs for operations (pnpm add, turbo build), not manual edits.

### **03 - Research Before Doing**
Create RESEARCH.md before implementing features (problem, approaches, decision).

### **04 - Code Quality & SOLID**
TypeScript strict mode, functions < 50 lines, Zod validation, tests required.

### **05 - Ask & Verify**
Clarify ambiguous requirements before coding. Never guess.

### **06 - Plan & Refactor**
Produce PLAN.md for non-trivial changes. Schedule refactor reviews.

### **07 - Next.js & React Standards**
Server components by default. Await params in Next.js 15. Prevent hydration errors.

### **08 - Database & Prisma**
Use Decimal for money. Always add createdAt/updatedAt. Index frequent queries.

### **09 - PR & Commit Standards**
Conventional commits. Small focused PRs. Include research notes.

### **10 - API Design**
Standardized responses. Validate inputs with Zod. Always verify auth AND authorization.

### **11 - Security**
Verify user owns resources. HTTP-only cookies. Never expose internals.

### **12 - Naming Conventions**
PascalCase components. camelCase functions. UPPER_SNAKE_CASE constants.

### **13 - Component Architecture**
Extract to @repo/ui when used by 2+ apps. Keep components under 300 lines.

### **14 - Performance**
Measure before optimizing. Use next/image. Paginate large lists.

### **15 - Error Handling**
User-friendly messages. Log server-side. Always try-catch async operations.

### **16 - Dependency Management**
Use CLI. Check maintenance, size, security before adding.

### **17 - Monorepo Structure**
apps/ for applications, packages/ for shared code. Clear responsibilities.

### **18 - Docker & Deployment**
Multi-stage builds. Non-root user. Health checks. Proper env vars.

### **19 - TypeScript Standards**
Strict mode. No any. Type public APIs. Prefer unions over enums.

### **20 - Financial Calculations**
Decimal for money. Store historical exchange rates. 6 decimal precision for rates.

### **21 - Date & Time Handling**
Store full timestamps (not just dates). Use date-fns for operations. Flexible display options.

### **22 - Mobile-First PWA**
Design mobile-first (320px+). All apps installable PWAs. Touch-friendly UI (44px+ targets).

---

## 🚀 **Quick Reference**

### **Adding a Feature**
1. Create `RESEARCH_[FEATURE].md`
2. Get approval on approach
3. Write code following standards
4. Add tests
5. Run `pnpm build && pnpm type-check && pnpm lint`
6. Commit with conventional format
7. Create PR with research link

### **Creating Components**
```typescript
// App-specific: apps/[app]/app/components/
// Shared: packages/ui/src/components/

'use client' // Only if needed

import { useState } from 'react'

interface MyComponentProps {
  title: string
  onSave: () => void
}

export function MyComponent({ title, onSave }: MyComponentProps) {
  const [state, setState] = useState()
  
  useEffect(() => {}, [])
  
  const handleClick = () => {}
  
  if (loading) return <Spinner />
  
  return <div>...</div>
}
```

### **Creating API Routes**
```typescript
// app/api/[resource]/route.ts

export async function POST(request: NextRequest) {
  try {
    // 1. Auth
    const payload = await verifyToken(token)
    const userId = payload.id
    
    // 2. Validate
    const data = CreateSchema.parse(await request.json())
    
    // 3. Authorize & Execute
    const result = await prisma.model.create({
      data: { ...data, userId }
    })
    
    // 4. Respond
    return NextResponse.json({ data: result }, { status: 201 })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ message: 'Failed' }, { status: 500 })
  }
}

// Dynamic routes: await params
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  // ...
}
```

### **Database Queries**
```typescript
// ✅ Good
await prisma.transaction.findMany({
  where: { userId, date: { gte: startDate } },
  select: { id: true, amount: true },
  orderBy: { date: 'desc' },
  take: 50,
  skip: page * 50,
})

// ❌ Bad
await prisma.transaction.findMany() // No filtering, fetches all
```

### **Multi-Currency**
```typescript
// Creating transaction
const conversion = await convertCurrency(
  amount,
  fromCurrency,
  baseCurrency,
  manualRate // optional
)

await prisma.transaction.create({
  data: {
    amount,              // Original: $200
    currency,            // Original: USD
    exchangeRate,        // Historical: 0.92
    baseAmount,          // Converted: €184
    baseCurrency,        // Base: EUR
  }
})

// Calculating totals
const total = transactions.reduce(
  (sum, t) => sum + Number(t.baseAmount), // Use baseAmount!
  0
)
```

---

## 🎯 **The Golden Rules**

1. **Research first** - Document approach before coding
2. **Minimal dependencies** - Use built-ins when possible
3. **Type everything** - TypeScript strict mode
4. **Validate inputs** - Zod at API boundaries
5. **Secure by default** - Verify userId on every query
6. **Decimal for money** - Never Float
7. **Server components first** - Client only when needed
8. **Small commits** - One logical change
9. **Document decisions** - Why, not what
10. **Measure then optimize** - Profile before optimizing

---

## 📚 **See Also**

- `.cursor/rules/` - Detailed rule files (enforced by Cursor)
- `RESEARCH_*.md` - Feature implementation research
- `DEPLOYMENT.md` - Deployment checklist
- Individual package READMEs for specific guidance

---

**Maintained by**: Youssef Altai  
**Questions?** Review rule files or existing RESEARCH.md documents
