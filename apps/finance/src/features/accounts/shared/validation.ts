import { Currency } from "@repo/db"
import { z } from "zod"

/**
 * Base schema for all account creation.
 * Includes common fields: name, description, currency, opening balance.
 */
export const baseCreateAccountSchema = z.object({
    name: z.string().min(1),
    description: z.string().optional(),
    currency: z.enum(Currency),
    openingBalance: z.number().nonnegative().optional(),
    openingBalanceExchangeRate: z.number().positive().optional(),
})

/**
 * Base schema for all account updates.
 * All fields are optional for partial updates.
 */
export const baseUpdateAccountSchema = z.object({
    name: z.string().min(1).optional(),
    description: z.string().optional(),
    currency: z.enum(Currency).optional(),
})

// Export types for reuse
export type BaseCreateAccountSchema = z.infer<typeof baseCreateAccountSchema>
export type BaseUpdateAccountSchema = z.infer<typeof baseUpdateAccountSchema>

