import { z } from "zod"
import { baseCreateAccountSchema, baseUpdateAccountSchema } from "../shared/validation"

// Expense Category creation schema (same as base)
export const createExpenseCategorySchema = baseCreateAccountSchema

export type CreateExpenseCategorySchema = z.infer<typeof createExpenseCategorySchema>

// Expense Category update schema (same as base)
export const updateExpenseCategorySchema = baseUpdateAccountSchema

export type UpdateExpenseCategorySchema = z.infer<typeof updateExpenseCategorySchema>

