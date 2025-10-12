import { z } from "zod"
import { baseCreateAccountSchema, baseUpdateAccountSchema } from "../shared/validation"

// Credit Card creation schema (same as base)
export const createCreditCardSchema = baseCreateAccountSchema

export type CreateCreditCardSchema = z.infer<typeof createCreditCardSchema>

// Credit Card update schema (same as base)
export const updateCreditCardSchema = baseUpdateAccountSchema

export type UpdateCreditCardSchema = z.infer<typeof updateCreditCardSchema>

