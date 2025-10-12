import { z } from "zod"
import { baseCreateAccountSchema, baseUpdateAccountSchema } from "../shared/validation"

// Loan creation schema (extends base with dueDate)
export const createLoanSchema = baseCreateAccountSchema.extend({
    dueDate: z.iso.datetime(),
})

export type CreateLoanSchema = z.infer<typeof createLoanSchema>

// Loan update schema (all optional including dueDate)
export const updateLoanSchema = baseUpdateAccountSchema.extend({
    dueDate: z.iso.datetime().optional(),
})

export type UpdateLoanSchema = z.infer<typeof updateLoanSchema>

