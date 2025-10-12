import { Currency } from "@repo/db"
import { z } from "zod"

/**
 * Schema for creating a budget
 * Requires: name, amount, currency, date range, and expense account IDs
 */
export const createBudgetSchema = z.object({
    name: z.string().min(1).max(100),
    amount: z.number().positive(),
    currency: z.enum(Currency),
    startDate: z.iso.datetime(),
    endDate: z.iso.datetime(),
    accountIds: z.array(z.string().cuid()).min(1, "At least one expense account is required"),
}).refine((data) => new Date(data.endDate) > new Date(data.startDate), {
    message: "End date must be after start date",
    path: ["endDate"],
})

export type CreateBudgetSchema = z.infer<typeof createBudgetSchema>

/**
 * Schema for updating a budget
 * All fields optional
 */
export const updateBudgetSchema = z.object({
    name: z.string().min(1).max(100).optional(),
    amount: z.number().positive().optional(),
    currency: z.enum(Currency).optional(),
    startDate: z.iso.datetime().optional(),
    endDate: z.iso.datetime().optional(),
    accountIds: z.array(z.string().cuid()).min(1, "At least one expense account is required").optional(),
}).refine((data) => {
    // Only validate date relationship if both are provided
    if (data.startDate && data.endDate) {
        return new Date(data.endDate) > new Date(data.startDate)
    }
    return true
}, {
    message: "End date must be after start date",
    path: ["endDate"],
})

export type UpdateBudgetSchema = z.infer<typeof updateBudgetSchema>

