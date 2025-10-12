import { Currency } from "@repo/db"
import { z } from "zod"
import {
    differentAccountsRefinement,
    currencyRequiredWithExchangeRateRefinement,
} from "../../shared/validation-refinements"

export const createTransactionSchema = z.object({
    description: z.string().min(1),
    fromAccountId: z.cuid(),
    toAccountId: z.cuid(),
    amount: z.number().positive(),
    currency: z.enum(Currency).optional(),
    exchangeRate: z.number().positive().optional(),
    date: z.iso.datetime(),
}).refine(differentAccountsRefinement(false), {
    message: "From and to accounts must be different",
    path: ["toAccountId"],
}).refine(currencyRequiredWithExchangeRateRefinement(), {
    message: "Currency is required when exchange rate is provided",
    path: ["currency"],
})

export type CreateTransactionSchema = z.infer<typeof createTransactionSchema>

export const updateTransactionSchema = z.object({
    description: z.string().min(1).optional(),
    fromAccountId: z.cuid().optional(),
    toAccountId: z.cuid().optional(),
    amount: z.number().positive().optional(),
    currency: z.enum(Currency).optional(),
    exchangeRate: z.number().positive().optional(),
    date: z.iso.datetime().optional(),
}).refine(differentAccountsRefinement(true), {
    message: "From and to accounts must be different",
    path: ["toAccountId"],
}).refine(currencyRequiredWithExchangeRateRefinement(), {
    message: "Currency is required when exchange rate is provided",
    path: ["currency"],
})

export type UpdateTransactionSchema = z.infer<typeof updateTransactionSchema>
