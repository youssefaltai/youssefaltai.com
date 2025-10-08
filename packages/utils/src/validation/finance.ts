/**
 * Validation schemas for Finance app
 * Using Zod for runtime type validation
 */
import { z } from 'zod'

// Transaction type enum
export const TransactionTypeSchema = z.enum(['income', 'expense'])

// Currency code validation (EGP, USD, GOLD_G)
export const CurrencyCodeSchema = z.enum(['EGP', 'USD', 'GOLD_G'], {
  errorMap: () => ({ message: 'Currency must be EGP, USD, or GOLD_G' })
})

// Rate source validation
export const RateSourceSchema = z.enum(['api', 'manual', 'market'])

// Date validation schema
export const DateTimeSchema = z.iso.datetime('Invalid datetime format')

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

// Create category schema
export const CreateCategorySchema = z.object({
  name: z.string().min(1, 'Category name is required').max(50, 'Category name too long'),
  type: TransactionTypeSchema,
  color: z.string().regex(/^#[0-9A-F]{6}$/i, 'Invalid color format').optional(),
  icon: z.string().max(10).optional(),
})

// Update category schema
export const UpdateCategorySchema = z.object({
  name: z.string().min(1, 'Category name is required').max(50, 'Category name too long').optional(),
  type: TransactionTypeSchema.optional(),
  color: z.string().regex(/^#[0-9A-F]{6}$/i, 'Invalid color format').optional(),
  icon: z.string().max(10).optional(),
})

// Update user settings schema
export const UpdateUserSettingsSchema = z.object({
  baseCurrency: CurrencyCodeSchema,
})

// Type exports for TypeScript
export type CreateTransactionInput = z.infer<typeof CreateTransactionSchema>
export type UpdateTransactionInput = z.infer<typeof UpdateTransactionSchema>
export type TransactionFilters = z.infer<typeof TransactionFiltersSchema>
export type CreateCategoryInput = z.infer<typeof CreateCategorySchema>
export type UpdateCategoryInput = z.infer<typeof UpdateCategorySchema>
export type UpdateUserSettingsInput = z.infer<typeof UpdateUserSettingsSchema>
export type TransactionType = z.infer<typeof TransactionTypeSchema>
export type RateSource = z.infer<typeof RateSourceSchema>
