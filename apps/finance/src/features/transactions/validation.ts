/**
 * Transaction validation schemas
 * Using Zod for runtime type validation
 */
import { z } from 'zod'

// Transaction type enum
export const TransactionTypeSchema = z.enum(['income', 'expense'])

// Currency code validation (EGP, USD, GOLD_G)
export const CurrencyCodeSchema = z.enum(['EGP', 'USD', 'GOLD_G'])

// Date validation schema
export const DateTimeSchema = z.string().datetime('Invalid datetime format')

// Create transaction schema
export const CreateTransactionSchema = z.object({
  amount: z.number().positive('Amount must be positive'),
  currency: CurrencyCodeSchema,
  exchangeRate: z.number().positive('Exchange rate must be positive').optional(),
  type: TransactionTypeSchema,
  category: z.string().min(1, 'Category is required'),
  description: z.string().optional(),
  date: DateTimeSchema,
})

// Update transaction schema (all fields optional except id)
export const UpdateTransactionSchema = z.object({
  amount: z.number().positive('Amount must be positive').optional(),
  currency: CurrencyCodeSchema.optional(),
  exchangeRate: z.number().positive('Exchange rate must be positive').optional(),
  type: TransactionTypeSchema.optional(),
  category: z.string().min(1, 'Category is required').optional(),
  description: z.string().optional(),
  date: DateTimeSchema.optional(),
})

// Transaction filters schema
export const TransactionFiltersSchema = z.object({
  type: TransactionTypeSchema.optional(),
  category: z.string().optional(),
  currency: CurrencyCodeSchema.optional(),
  dateFrom: DateTimeSchema.optional(),
  dateTo: DateTimeSchema.optional(),
  page: z.number().int().positive().default(1).optional(),
  limit: z.number().int().positive().max(100).default(50).optional(),
})

// Type exports for TypeScript
export type CreateTransactionInput = z.infer<typeof CreateTransactionSchema>
export type UpdateTransactionInput = z.infer<typeof UpdateTransactionSchema>
export type TransactionFilters = z.infer<typeof TransactionFiltersSchema>
export type TransactionType = z.infer<typeof TransactionTypeSchema>

