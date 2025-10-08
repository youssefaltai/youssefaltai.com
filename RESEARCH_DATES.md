# Date & Time Handling - Research & Standards

## Problem Statement
Establish consistent date/time handling across the stack that stores full timestamps, handles timezones correctly, and provides flexible display options.

---

## 🎯 **Chosen Approach: Store Full Timestamps with date-fns**

### **Why Store Times (Not Just Dates)?**

1. **Data Richness:**
   - "Bought coffee at 7:30am before work" vs "Bought coffee"
   - Useful for pattern analysis (spending habits by time of day)
   - Future-proof: Can always ignore time, can't add it retroactively

2. **Consistency Across Apps:**
   - Finance: Transaction timestamps
   - Fitness: Workout times (definitely needs precise times)
   - Dashboard: Unified timeline view

3. **Flexibility:**
   - Show date-only for finance: "Jan 15, 2024"
   - Show date+time for fitness: "Jan 15, 2024 at 7:30 AM"
   - User chooses granularity

---

## 📚 **Library Choice: date-fns**

**Why date-fns over alternatives:**

| Feature | date-fns | dayjs | Luxon | Native |
|---------|----------|-------|-------|--------|
| Bundle Size | 2-3 KB/fn | 2 KB | 23 KB | 0 KB |
| Tree-shakeable | ✅ Yes | ✅ Yes | ✅ Yes | N/A |
| Immutable | ✅ Yes | ❌ No | ✅ Yes | ❌ No |
| TypeScript | ✅ Excellent | ✅ Good | ✅ Good | ✅ Built-in |
| Timezone | Plugin | Plugin | Built-in | Basic |
| API Quality | ✅ Functional | Medium | ✅ OOP | ❌ Poor |
| Popularity | 50M/mo | 19M/mo | 3M/mo | N/A |

**Decision:** **date-fns** wins on immutability, tree-shaking, and ecosystem.

**Bundle Impact:**
- `format`: 2.1 KB
- `parseISO`: 0.5 KB
- `startOfMonth`: 0.3 KB
- `addDays`: 0.4 KB
- **Total for common operations: ~5 KB** (acceptable)

---

## 🏗️ **Architecture**

### **1. Database (Prisma)**
```prisma
model Transaction {
  date DateTime  // Stores full timestamp with timezone
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

**Storage:**
- PostgreSQL stores as UTC timestamp
- Preserves full precision (date + time + milliseconds)

### **2. API Layer**
```typescript
import { parseISO, formatISO } from 'date-fns'

// Receiving from client
const date = parseISO(data.date)  // "2024-01-15T14:30:00Z" → Date

// Sending to client  
const response = {
  date: transaction.date.toISOString()  // Date → "2024-01-15T14:30:00.000Z"
}
```

### **3. Client Layer**
```typescript
import { format, parseISO } from 'date-fns'

// Form input (datetime-local for full precision)
<input
  type="datetime-local"
  value={format(date, "yyyy-MM-dd'T'HH:mm")}
  onChange={(e) => setDate(parseISO(e.target.value))}
/>

// Or date-only input (time defaults to current time)
<input
  type="date"
  value={format(date, 'yyyy-MM-dd')}
/>
```

### **4. Display Layer**
```typescript
import { format, formatDistanceToNow } from 'date-fns'

// Full date + time
format(date, 'PPp')  → "Jan 15, 2024 at 2:30 PM"

// Date only
format(date, 'PP')  → "Jan 15, 2024"

// Relative
formatDistanceToNow(date, { addSuffix: true })  → "2 days ago"

// Custom
format(date, 'MMM d, yyyy')  → "Jan 15, 2024"
```

---

## 🎯 **The Golden Rules**

### **Rule 1: Always Store Full Timestamps**
```typescript
// ✅ Store complete timestamp
date: DateTime  // 2024-01-15T14:30:00.000Z

// ❌ Don't store date-only
date: String  // "2024-01-15" (loses time info forever)
```

### **Rule 2: Database is Always UTC**
```typescript
// ✅ Let Prisma handle UTC conversion
await prisma.transaction.create({
  data: {
    date: new Date()  // Prisma converts to UTC
  }
})

// ❌ Don't manually convert timezones
date: new Date().toLocaleString('en-US', { timeZone: 'America/New_York' })
```

### **Rule 3: ISO 8601 for Transport**
```typescript
// ✅ Client → API: ISO string
fetch('/api/transactions', {
  body: JSON.stringify({
    date: new Date().toISOString()  // "2024-01-15T14:30:00.000Z"
  })
})

// ✅ API → Client: ISO string
return NextResponse.json({
  date: transaction.date.toISOString()
})

// ❌ Don't use Unix timestamps
date: Date.now()  // 1704461400000 (not human-readable)
```

### **Rule 4: Format for Display Only**
```typescript
import { format } from 'date-fns'

// ✅ Format at render time
{format(parseISO(transaction.date), 'PP')}

// ❌ Don't store formatted strings
await prisma.transaction.create({
  date: "Jan 15, 2024"  // WRONG! Store Date objects
})
```

### **Rule 5: User Timezone (Future)**
```typescript
// For single-user app: Use browser's timezone
format(date, 'PP')  // Automatically uses browser timezone

// For multi-user: Store user's timezone preference
userSettings {
  timezone: "America/New_York"
}

// Display with user's timezone
import { formatInTimeZone } from 'date-fns-tz'
formatInTimeZone(date, userSettings.timezone, 'PP')
```

---

## 🛠️ **Practical Implementation**

### **Enhanced Date Utilities (`packages/utils/src/lib/date.ts`)**

```typescript
import {
  format,
  parseISO,
  formatDistanceToNow,
  startOfMonth,
  endOfMonth,
  startOfDay,
  endOfDay,
  addDays,
  addMonths,
  isToday,
  isYesterday,
  isSameDay,
} from 'date-fns'

/**
 * Parse ISO date string to Date object
 */
export function parseDate(dateString: string): Date {
  return parseISO(dateString)
}

/**
 * Format date for display (no time)
 */
export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? parseISO(date) : date
  return format(d, 'PP')  // "Jan 15, 2024"
}

/**
 * Format date with time
 */
export function formatDateTime(date: Date | string): string {
  const d = typeof date === 'string' ? parseISO(date) : date
  return format(d, 'PPp')  // "Jan 15, 2024 at 2:30 PM"
}

/**
 * Format as short date
 */
export function formatDateShort(date: Date | string): string {
  const d = typeof date === 'string' ? parseISO(date) : date
  return format(d, 'MMM d, yyyy')  // "Jan 15, 2024"
}

/**
 * Format relative time
 */
export function formatRelative(date: Date | string): string {
  const d = typeof date === 'string' ? parseISO(date) : date
  
  if (isToday(d)) return 'Today'
  if (isYesterday(d)) return 'Yesterday'
  
  return formatDistanceToNow(d, { addSuffix: true })  // "2 days ago"
}

/**
 * Get today's date
 */
export function today(): Date {
  return new Date()
}

/**
 * Get current month boundaries
 */
export function currentMonthRange(): { start: Date; end: Date } {
  const now = new Date()
  return {
    start: startOfMonth(now),
    end: endOfMonth(now),
  }
}

/**
 * Get date for input field (datetime-local format)
 */
export function toDateTimeLocalString(date: Date): string {
  return format(date, "yyyy-MM-dd'T'HH:mm")
}

/**
 * Get date for input field (date format)
 */
export function toDateString(date: Date): string {
  return format(date, 'yyyy-MM-dd')
}

// Re-export useful date-fns functions
export {
  addDays,
  addMonths,
  startOfMonth,
  endOfMonth,
  startOfDay,
  endOfDay,
  isSameDay,
  parseISO,
}
```

### **Updated Transaction Form**

```typescript
import { today, toDateTimeLocalString, parseISO } from '@repo/utils'

export function TransactionForm({ onSuccess }: TransactionFormProps) {
  const [date, setDate] = useState(new Date())  // Store as Date object
  const [showTimeInput, setShowTimeInput] = useState(false)
  
  return (
    <div>
      {/* Date input */}
      <input
        type="date"
        value={toDateString(date)}
        onChange={(e) => setDate(parseISO(e.target.value + 'T12:00:00'))}
      />
      
      {/* Optional: Time input */}
      <label>
        <input
          type="checkbox"
          checked={showTimeInput}
          onChange={(e) => setShowTimeInput(e.target.checked)}
        />
        Include time
      </label>
      
      {showTimeInput && (
        <input
          type="time"
          value={format(date, 'HH:mm')}
          onChange={(e) => {
            const [hours, minutes] = e.target.value.split(':')
            const newDate = new Date(date)
            newDate.setHours(parseInt(hours), parseInt(minutes))
            setDate(newDate)
          }}
        />
      )}
      
      // Submit
      fetch('/api/transactions', {
        body: JSON.stringify({
          date: date.toISOString(),  // "2024-01-15T14:30:00.000Z"
          // ...
        })
      })
    </div>
  )
}
```

### **Updated Transaction List**

```typescript
import { formatDate, formatDateTime, formatRelative } from '@repo/utils'

export function TransactionList({ transactions }: Props) {
  return (
    <td>
      {/* Show date only for finance */}
      {formatDate(transaction.date)}
      
      {/* Or show relative time */}
      <span className="text-sm text-gray-500">
        {formatRelative(transaction.date)}
      </span>
      
      {/* Hover for full timestamp */}
      <span title={formatDateTime(transaction.date)}>
        {formatDate(transaction.date)}
      </span>
    </td>
  )
}
```

---

## 🎯 **Decision: Store Full Timestamps**

**Rationale:**

1. **More Information:** Can always hide time, can't add it later
2. **Consistency:** Same approach for Finance (optional time) and Fitness (required time)
3. **Analytics:** Time-of-day spending patterns
4. **Future-proof:** No migration needed later

**UX:**
- Finance: Default to date-only display, optional time input
- Fitness: Always show time (workout at 7:30 AM)
- Dashboard: Smart display (relative for recent, date for old)

---

**Implementing now with date-fns...** 🚀
