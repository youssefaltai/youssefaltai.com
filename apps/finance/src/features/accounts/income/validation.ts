import { z } from "zod"
import { baseCreateAccountSchema, baseUpdateAccountSchema } from "../shared/validation"

// Income Source creation schema (same as base)
export const createIncomeSourceSchema = baseCreateAccountSchema

export type CreateIncomeSourceSchema = z.infer<typeof createIncomeSourceSchema>

// Income Source update schema (same as base)
export const updateIncomeSourceSchema = baseUpdateAccountSchema

export type UpdateIncomeSourceSchema = z.infer<typeof updateIncomeSourceSchema>

