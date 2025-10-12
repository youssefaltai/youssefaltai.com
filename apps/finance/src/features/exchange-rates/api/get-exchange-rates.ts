import { prisma, ExchangeRate, Currency } from "@repo/db"

/**
 * Get all exchange rates for a user
 * Returns rates that are not soft-deleted
 * 
 * @param userId - User ID
 * @param fromCurrency - Optional filter by source currency
 * @param toCurrency - Optional filter by target currency
 * @returns Array of exchange rates
 */
export default async function getExchangeRates(
    userId: string,
    fromCurrency?: Currency,
    toCurrency?: Currency
): Promise<ExchangeRate[]> {
    const rates = await prisma.exchangeRate.findMany({
        where: {
            userId,
            deletedAt: null,
            ...(fromCurrency && { fromCurrency }),
            ...(toCurrency && { toCurrency }),
        },
        orderBy: [
            { fromCurrency: 'asc' },
            { toCurrency: 'asc' },
        ],
    })

    return rates
}

