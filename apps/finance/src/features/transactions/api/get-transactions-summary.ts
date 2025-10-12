import { prisma, Prisma } from "@repo/db"
import { GetTransactionsSummaryQuerySchema } from "../validation"
import { convertAmount, ExchangeRateMap } from "../../../shared/finance-utils"

/**
 * Transaction summary response
 */
export interface TransactionSummary {
    totalIncome: number
    totalExpenses: number
    totalTransfers: number
    transactionCount: number
    incomeCount: number
    expenseCount: number
    transferCount: number
}

/**
 * Get transaction summary with server-side aggregation
 * Calculates income, expenses, and transfers for a given date range
 * All amounts are converted to the user's base currency for accurate reporting
 * 
 * @param userId - User ID
 * @param filters - Query filters (date range, optional account filtering)
 * @returns Transaction summary with aggregated totals in base currency
 */
export default async function getTransactionsSummary(
    userId: string,
    filters: GetTransactionsSummaryQuerySchema
): Promise<TransactionSummary> {
    const { dateFrom, dateTo, accountIds } = filters

    // Get user's base currency and exchange rates
    const [user, exchangeRates] = await Promise.all([
        prisma.user.findUnique({
            where: { id: userId },
            select: { baseCurrency: true },
        }),
        prisma.exchangeRate.findMany({
            where: { userId, deletedAt: null },
            select: { fromCurrency: true, toCurrency: true, rate: true },
        }),
    ])

    if (!user) {
        throw new Error("User not found")
    }

    const baseCurrency = user.baseCurrency

    // Build exchange rate map for quick lookup
    const rateMap: ExchangeRateMap = new Map()
    for (const rate of exchangeRates) {
        const key = `${rate.fromCurrency}_TO_${rate.toCurrency}`
        rateMap.set(key, rate.rate)
    }

    // Build base where clause
    const baseWhere: Prisma.TransactionWhereInput = {
        userId,
        deletedAt: null,
        date: {
            gte: new Date(dateFrom),
            lte: new Date(dateTo),
        },
    }

    // Build fromAccount and toAccount filters
    const fromAccountFilter: Prisma.AccountWhereInput = {
        deletedAt: null,
        userId,
    }

    const toAccountFilter: Prisma.AccountWhereInput = {
        deletedAt: null,
        userId,
    }

    // Apply account filtering if specified
    if (accountIds && accountIds.length > 0) {
        baseWhere.OR = [
            { fromAccountId: { in: accountIds } },
            { toAccountId: { in: accountIds } },
        ]
    }

    // Fetch INCOME transactions: FROM income account TO asset account
    const incomeWhere: Prisma.TransactionWhereInput = {
        ...baseWhere,
        fromAccount: {
            ...fromAccountFilter,
            type: 'income',
        },
        toAccount: {
            ...toAccountFilter,
            type: 'asset',
        },
    }

    const incomeTransactions = await prisma.transaction.findMany({
        where: incomeWhere,
        select: {
            amount: true,
            currency: true,
            exchangeRate: true,
            fromAccount: { select: { currency: true } },
            toAccount: { select: { currency: true } },
        },
    })

    const incomeCount = incomeTransactions.length

    // Fetch EXPENSE transactions: FROM asset account TO expense account
    const expenseWhere: Prisma.TransactionWhereInput = {
        ...baseWhere,
        fromAccount: {
            ...fromAccountFilter,
            type: 'asset',
        },
        toAccount: {
            ...toAccountFilter,
            type: 'expense',
        },
    }

    const expenseTransactions = await prisma.transaction.findMany({
        where: expenseWhere,
        select: {
            amount: true,
            currency: true,
            exchangeRate: true,
            fromAccount: { select: { currency: true } },
            toAccount: { select: { currency: true } },
        },
    })

    const expenseCount = expenseTransactions.length

    // Fetch TRANSFER transactions: FROM asset account TO asset account
    const transferWhere: Prisma.TransactionWhereInput = {
        ...baseWhere,
        fromAccount: {
            ...fromAccountFilter,
            type: 'asset',
        },
        toAccount: {
            ...toAccountFilter,
            type: 'asset',
        },
    }

    const transferTransactions = await prisma.transaction.findMany({
        where: transferWhere,
        select: {
            amount: true,
            currency: true,
            exchangeRate: true,
            fromAccount: { select: { currency: true } },
            toAccount: { select: { currency: true } },
        },
    })

    const transferCount = transferTransactions.length

    // Convert all transactions to base currency and sum
    const totalIncome = incomeTransactions.reduce((sum, tx) => {
        try {
            const baseAmount = convertAmount(
                tx.amount,
                tx.currency,
                baseCurrency,
                rateMap
            )
            return sum + Number(baseAmount)
        } catch (error) {
            console.warn(`Failed to convert income transaction: ${error}`)
            return sum
        }
    }, 0)

    const totalExpenses = expenseTransactions.reduce((sum, tx) => {
        try {
            const baseAmount = convertAmount(
                tx.amount,
                tx.currency,
                baseCurrency,
                rateMap
            )
            return sum + Number(baseAmount)
        } catch (error) {
            console.warn(`Failed to convert expense transaction: ${error}`)
            return sum
        }
    }, 0)

    const totalTransfers = transferTransactions.reduce((sum, tx) => {
        try {
            const baseAmount = convertAmount(
                tx.amount,
                tx.currency,
                baseCurrency,
                rateMap
            )
            return sum + Number(baseAmount)
        } catch (error) {
            console.warn(`Failed to convert transfer transaction: ${error}`)
            return sum
        }
    }, 0)

    return {
        totalIncome,
        totalExpenses,
        totalTransfers,
        transactionCount: incomeCount + expenseCount + transferCount,
        incomeCount,
        expenseCount,
        transferCount,
    }
}

