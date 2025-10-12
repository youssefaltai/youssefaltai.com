import { prisma, ExchangeRate, Prisma } from "@repo/db"
import { setExchangeRateSchema, SetExchangeRateSchema } from "../validation"

/**
 * Set or update an exchange rate for a user
 * Creates if doesn't exist, updates if it does
 * 
 * @param userId - User ID
 * @param input - Exchange rate data (fromCurrency, toCurrency, rate)
 * @returns The created or updated exchange rate
 */
export default async function setExchangeRate(
    userId: string,
    input: SetExchangeRateSchema
): Promise<ExchangeRate> {
    // Validate input
    const validated = setExchangeRateSchema.parse(input)
    const { fromCurrency, toCurrency, rate } = validated

    // Upsert: create if doesn't exist, update if it does
    const exchangeRate = await prisma.exchangeRate.upsert({
        where: {
            userId_fromCurrency_toCurrency: {
                userId,
                fromCurrency,
                toCurrency,
            },
        },
        create: {
            userId,
            fromCurrency,
            toCurrency,
            rate: new Prisma.Decimal(rate),
        },
        update: {
            rate: new Prisma.Decimal(rate),
            deletedAt: null, // Un-delete if it was soft-deleted
        },
    })

    console.log('Exchange rate set:', {
        userId,
        fromCurrency,
        toCurrency,
        rate,
        isNew: exchangeRate.createdAt === exchangeRate.updatedAt,
    })

    return exchangeRate
}

