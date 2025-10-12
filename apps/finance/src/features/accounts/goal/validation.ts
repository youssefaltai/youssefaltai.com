import { z } from "zod"
import { baseCreateAccountSchema, baseUpdateAccountSchema } from "../shared/validation"

// Goal creation schema (extends base with target and dueDate)
export const createGoalSchema = baseCreateAccountSchema.extend({
    target: z.number().positive(),
    dueDate: z.iso.datetime(),
})

export type CreateGoalSchema = z.infer<typeof createGoalSchema>

// Goal update schema (all optional including target and dueDate)
export const updateGoalSchema = baseUpdateAccountSchema.extend({
    target: z.number().positive().optional(),
    dueDate: z.iso.datetime().optional(),
})

export type UpdateGoalSchema = z.infer<typeof updateGoalSchema>

