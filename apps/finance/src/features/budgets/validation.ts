import { z } from 'zod'

// Currency code validation
const CurrencyCodeSchema = z.enum(['EGP', 'USD', 'GOLD_G'])

// Date validation schema (accepts both date and datetime strings)
const DateSchema = z.string().min(1, 'Date is required')

// Create budget schema
export const CreateBudgetSchema = z.object({
  name: z.string().min(1, 'Budget name is required'),
  amount: z.number().positive('Amount must be positive'),
  currency: CurrencyCodeSchema,
  categories: z.array(z.string()).min(1, 'At least one category is required'),
  startDate: DateSchema,
  endDate: DateSchema,
}).refine(
  (data) => new Date(data.endDate) >= new Date(data.startDate),
  {
    message: 'End date must be after or equal to start date',
    path: ['endDate'],
  }
)

// Update budget schema (all fields optional)
export const UpdateBudgetSchema = z.object({
  name: z.string().min(1, 'Budget name is required').optional(),
  amount: z.number().positive('Amount must be positive').optional(),
  currency: CurrencyCodeSchema.optional(),
  categories: z.array(z.string()).min(1, 'At least one category is required').optional(),
  startDate: DateSchema.optional(),
  endDate: DateSchema.optional(),
}).refine(
  (data) => {
    if (data.startDate && data.endDate) {
      return new Date(data.endDate) >= new Date(data.startDate)
    }
    return true
  },
  {
    message: 'End date must be after or equal to start date',
    path: ['endDate'],
  }
)

// Budget filters schema
export const BudgetFiltersSchema = z.object({
  categories: z.array(z.string()).optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
})

// Type exports
export type CreateBudgetInput = z.infer<typeof CreateBudgetSchema>
export type UpdateBudgetInput = z.infer<typeof UpdateBudgetSchema>
export type BudgetFilters = z.infer<typeof BudgetFiltersSchema>

