# Money Formatting - Research & Best Practices

## Problem Statement
Implement proper money formatting for Egyptian Pound (EGP), US Dollar (USD), and gold (grams) with thousands separators, proper symbol placement, and locale-aware display.

---

## 🎯 **Current Issues**

Your current `formatCurrency()`:
```typescript
formatCurrency(5000, 'EGP') → "E£5000.00"  // ❌ No thousands separator
formatCurrency(114750, 'EGP') → "E£114750.00"  // ❌ Hard to read
```

**Problems:**
- ❌ No thousands/millions separators (5000 vs 5,000)
- ❌ Manual symbol placement logic
- ❌ Doesn't respect Egyptian locale conventions
- ❌ Not extensible for other currencies

---

## 📊 **Candidate Approaches**

### **Approach 1: Native `Intl.NumberFormat` (RECOMMENDED)**

**Concept:** Use browser's built-in internationalization API.

```typescript
new Intl.NumberFormat('en-EG', {
  style: 'currency',
  currency: 'EGP'
}).format(5000)
// → "E£5,000.00" or "EGP 5,000.00" (browser dependent)
```

**Pros:**
- ✅ Zero dependencies (built into every browser/Node.js)
- ✅ Automatic thousands separators
- ✅ Locale-aware (respects Egyptian conventions)
- ✅ Handles all 180+ currencies automatically
- ✅ Symbol placement handled correctly
- ✅ Fast (native code)

**Cons:**
- ❌ Can't handle custom "currencies" like GOLD_G
- ❌ Symbol format varies by browser/locale
- ❌ Limited customization

**Bundle Size:** 0 KB ✅

---

### **Approach 2: currency.js Library**

**Concept:** Small library for money arithmetic and formatting.

```typescript
import currency from 'currency.js'

currency(5000, { symbol: 'E£' }).format()
// → "E£5,000.00"
```

**Pros:**
- ✅ Small (5KB gzipped)
- ✅ Handles arithmetic (prevents floating point errors)
- ✅ Custom symbols supported
- ✅ Thousands separators built-in

**Cons:**
- ❌ Additional dependency
- ❌ Mainly for arithmetic (we use Prisma Decimal for that)
- ❌ Doesn't add much value for display-only use

**Bundle Size:** 5 KB

---

### **Approach 3: dinero.js Library**

**Concept:** Immutable money library with formatting.

```typescript
import { dinero, toDecimal } from 'dinero.js'
import { EGP } from '@dinero.js/currencies'

dinero({ amount: 500000, currency: EGP })
  .toFormat() // → "5,000.00"
```

**Pros:**
- ✅ Immutable
- ✅ Type-safe
- ✅ Handles multiple currencies

**Cons:**
- ❌ Larger (15KB+ gzipped)
- ❌ Complex API
- ❌ Overkill for display formatting
- ❌ We already use Prisma Decimal for calculations

**Bundle Size:** 15+ KB

---

### **Approach 4: Hybrid (Native + Custom for Gold)**

**Concept:** Use `Intl.NumberFormat` for real currencies, custom logic for gold.

```typescript
export function formatCurrency(amount: number, currency: string): string {
  // Gold: Custom formatting
  if (currency === 'GOLD_G') {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 3,
      maximumFractionDigits: 3
    }).format(amount) + 'g'
    // → "25.500g" or "1,234.567g"
  }
  
  // Regular currencies: Native formatting
  return new Intl.NumberFormat('en-EG', {
    style: 'currency',
    currency: currency
  }).format(amount)
  // → "E£5,000.00" or "$100.00"
}
```

**Pros:**
- ✅ Zero dependencies
- ✅ Proper thousands separators
- ✅ Locale-aware
- ✅ Handles custom GOLD_G
- ✅ Clean and simple

**Cons:**
- ❌ Can't fully control symbol format (browser dependent)
- ❌ EGP might show as "EGP" instead of "E£" in some browsers

**Bundle Size:** 0 KB ✅

---

## 💡 **Best Practices for Money Display**

### **1. Thousands Separators**
```
✅ 5,000.00       - Easy to read
✅ 114,750.00     - Clear magnitude
✅ 1,234,567.89   - Large numbers readable
❌ 5000.00        - Harder to parse
❌ 114750.00      - Is it 11K or 114K?
```

### **2. Decimal Places**
```
Currencies: 2 decimals (E£5,000.00, $100.00)
Gold: 3 decimals (125.500g) - More precision needed
Bitcoin: 8 decimals (0.00012345 BTC) - Not needed for your case
```

### **3. Symbol Placement**
```
EGP: E£5,000.00   (symbol before, no space)
USD: $100.00       (symbol before, no space)
EUR: €50.00        (symbol before, no space)
Gold: 25.500g      (unit after, no space)
```

### **4. Negative Numbers**
```
✅ -E£5,000.00     (minus before symbol)
✅ (E£5,000.00)    (accounting style)
❌ E£-5,000.00     (symbol before minus)
```

### **5. Alignment in Tables**
```
Right-align numbers for easy comparison:
  E£5,000.00
  E£1,234.56
E£114,750.00
```

---

## 🎯 **Chosen Approach: Hybrid with Intl.NumberFormat**

### **Why:**
1. **Zero dependencies** - Aligns with minimalism principle
2. **Proper thousands separators** - Built-in
3. **Locale-aware** - Respects Egyptian conventions
4. **Flexible** - Can handle custom GOLD_G
5. **Future-proof** - Easy to add more currencies

### **Implementation:**

```typescript
/**
 * Format monetary amount with proper thousands separators and symbols
 * Uses Intl.NumberFormat for locale-aware formatting
 * 
 * @param amount - Amount to format (number, string, or Prisma Decimal)
 * @param currency - Currency code (EGP, USD, GOLD_G)
 * @param options - Optional formatting options
 * @returns Formatted string with thousands separators
 * 
 * @example
 * formatCurrency(5000, 'EGP') → "E£5,000.00"
 * formatCurrency(114750.50, 'EGP') → "E£114,750.50"
 * formatCurrency(100, 'USD') → "$100.00"
 * formatCurrency(25.5, 'GOLD_G') → "25.500g"
 */
export function formatCurrency(
  amount: number | string,
  currency: string,
  options?: {
    compact?: boolean  // e.g., "5K" instead of "5,000"
    hideSymbol?: boolean
  }
): string {
  // Parse amount
  const numericAmount = typeof amount === 'string' ? Number(amount) : amount
  if (isNaN(numericAmount)) {
    throw new Error(`Invalid amount: ${amount}`)
  }
  
  // Special handling for gold (grams)
  if (currency === 'GOLD_G') {
    const formatted = new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 3,
      maximumFractionDigits: 3,
      ...(options?.compact && { notation: 'compact' })
    }).format(numericAmount)
    
    return options?.hideSymbol ? formatted : `${formatted}g`
  }
  
  // Handle real currencies with Intl.NumberFormat
  try {
    const formatted = new Intl.NumberFormat('en-EG', {
      style: 'currency',
      currency: currency,
      currencyDisplay: 'symbol', // Show symbol (E£) not code (EGP)
      ...(options?.compact && { notation: 'compact', compactDisplay: 'short' })
    }).format(numericAmount)
    
    return formatted
  } catch (error) {
    // Fallback for unknown currencies (shouldn't happen with our enum)
    console.warn(`Unknown currency: ${currency}, using fallback formatting`)
    const symbol = getCurrencySymbol(currency)
    const formatted = numericAmount.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })
    return `${symbol}${formatted}`
  }
}

/**
 * Format as compact notation (for large numbers)
 * @example formatCurrencyCompact(5000, 'EGP') → "E£5K"
 * @example formatCurrencyCompact(1500000, 'EGP') → "E£1.5M"
 */
export function formatCurrencyCompact(amount: number | string, currency: string): string {
  return formatCurrency(amount, currency, { compact: true })
}
```

---

## 🌍 **Egyptian Pound (EGP) Formatting**

### **Standard Format:**
```
Arabic (Egypt):  ج.م.‏5٬000٫00  (Arabic numerals + symbols)
English (Egypt): E£5,000.00       (Latin numerals)
```

**For your app:** Use `en-EG` locale (English numerals with Egyptian conventions).

### **Intl.NumberFormat Output:**
```javascript
new Intl.NumberFormat('en-EG', { style: 'currency', currency: 'EGP' }).format(5000)
// Browser-dependent result:
// Chrome/Firefox: "EGP 5,000.00"  (might show code instead of symbol)
// Safari: "E£5,000.00"            (might show symbol)
```

**Solution:** If browser shows "EGP" instead of "E£", we can post-process:
```typescript
formatted.replace(/EGP\s?/, 'E£')
```

---

## 📋 **Formatting Matrix**

| Amount | Currency | Output | Use Case |
|--------|----------|--------|----------|
| 5000 | EGP | E£5,000.00 | Standard display |
| 114750.50 | EGP | E£114,750.50 | Large amount |
| 1500000 | EGP | E£1.5M | Compact (charts) |
| 100 | USD | $100.00 | Foreign currency |
| 25.5 | GOLD_G | 25.500g | Gold grams |
| 1234.567 | GOLD_G | 1,234.567g | Gold with separator |

---

## 🎯 **Recommendations**

### **For Your Use Case:**

**✅ Use Approach 4 (Hybrid with Intl.NumberFormat)**

**Why:**
1. **Zero bundle cost** - No external library
2. **Proper formatting** - Thousands separators, locale-aware
3. **Flexible** - Handles your custom GOLD_G
4. **Standards-compliant** - Uses web standards
5. **Maintainable** - Simple code, easy to understand

### **Enhanced Features to Add:**

1. **Thousands separators** - Primary improvement
2. **Compact notation** - For charts/summary cards ("5K", "1.5M")
3. **Symbol fallback** - Replace "EGP" with "E£" if browser shows code
4. **Right-to-left support** - For Arabic (future)
5. **Input formatting** - Format as user types (optional)

---

## 🚫 **Don't Need These**

**dinero.js / currency.js:** Overkill for your use case
- You already have Prisma Decimal for calculations
- Only need formatting, not arithmetic
- Adds 5-15KB for features you won't use

**Why not:**
- Violates minimalism principle
- Intl.NumberFormat does 90% of what you need
- Can always add later if needed

---

## 🔧 **Implementation Plan**

### **Phase 1: Update formatCurrency**
- Use `Intl.NumberFormat` for real currencies
- Keep custom logic for GOLD_G
- Add thousands separators
- Post-process to ensure "E£" symbol

### **Phase 2: Add Compact Formatting**
- For summary cards: "E£1.5M" instead of "E£1,500,000"
- For charts: Shorter labels

### **Phase 3: Enhanced Display**
```typescript
// Different contexts
<TransactionRow>
  {formatCurrency(amount, currency)}  // Full: "E£5,000.00"
</TransactionRow>

<SummaryCard>
  {formatCurrencyCompact(total, 'EGP')}  // Compact: "E£1.5M"
</SummaryCard>
```

---

## 📝 **Examples of What Will Change**

### **Before (Current):**
```
Income:  E£5000.00
Expenses: E£114750.00
Balance: E£-109750.00
```

### **After (With Thousands Separators):**
```
Income:  E£5,000.00
Expenses: E£114,750.00
Balance: -E£109,750.00
```

**Much more readable!** ✅

---

## 🎯 **Decision**

**Use Native `Intl.NumberFormat` with custom logic for GOLD_G**

**Rationale:**
- Zero dependencies
- Proper thousands separators (primary need)
- Locale-aware formatting
- Simple implementation
- Easy to maintain

**Alternatives rejected:**
- **currency.js**: 5KB for features we don't need
- **dinero.js**: 15KB+ too heavy
- **Manual formatting**: Intl.NumberFormat is better

---

## ✅ **Ready to Implement?**

The enhanced `formatCurrency()` will:
- Add thousands separators: 5,000 not 5000
- Use Intl.NumberFormat for EGP and USD
- Keep custom logic for GOLD_G
- Support compact notation (optional)
- Post-process to ensure "E£" symbol

**Zero dependencies, better UX, proper formatting!** 🎉
