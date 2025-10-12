import { z } from "zod"
import { Currency } from "@repo/db"

/**
 * Schema for setting/updating exchange rates
 */
export const setExchangeRateSchema = z.object({
    fromCurrency: z.nativeEnum(Currency),
    toCurrency: z.nativeEnum(Currency),
    rate: z.number().positive("Exchange rate must be positive"),
}).refine(
    (data) => data.fromCurrency !== data.toCurrency,
    { message: "fromCurrency and toCurrency must be different" }
)

export type SetExchangeRateSchema = z.infer<typeof setExchangeRateSchema>

/**
 * Schema for getting exchange rates
 */
export const getExchangeRatesSchema = z.object({
    fromCurrency: z.nativeEnum(Currency).optional(),
    toCurrency: z.nativeEnum(Currency).optional(),
})

export type GetExchangeRatesSchema = z.infer<typeof getExchangeRatesSchema>

