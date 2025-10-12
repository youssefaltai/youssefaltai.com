import { prisma, Prisma, Currency } from "@repo/db"
import { getBudget } from "./get-budget"
import { convertAmount, ExchangeRateMap } from "../../../shared/finance-utils"

export interface BudgetProgress {
    budgetId: string
    budgetAmount: number
    budgetCurrency: Currency
    spent: number
    remaining: number
    percentage: number
    isOverBudget: boolean
}

/**
 * Calculates budget progress by summing transactions to expense accounts.
 * 
 * @param userId - The authenticated user's ID
 * @param budgetId - The budget ID
 * @returns Budget progress with spent amount, remaining, and percentage
 * @throws Error if budget not found or user doesn't own it
 */
export async function getBudgetProgress(
    userId: string,
    budgetId: string
): Promise<BudgetProgress> {
    // Get the budget with accounts
    const budget = await getBudget(userId, budgetId)
    
    const accountIds = budget.accounts.map(ba => ba.accountId)
    
    // If no accounts, return zero spending
    if (accountIds.length === 0) {
        return {
            budgetId: budget.id,
            budgetAmount: Number(budget.amount),
            budgetCurrency: budget.currency,
            spent: 0,
            remaining: Number(budget.amount),
            percentage: 0,
            isOverBudget: false,
        }
    }

    // Fetch all transactions TO the expense accounts within budget period
    const transactions = await prisma.transaction.findMany({
        where: {
            toAccountId: { in: accountIds },
            date: {
                gte: budget.startDate,
                lte: budget.endDate,
            },
            deletedAt: null,
        },
        select: {
            amount: true,
            currency: true,
            exchangeRate: true,
            toAccount: {
                select: {
                    currency: true,
                },
            },
        },
    })

    // Fetch user's exchange rates for currency conversion
    const exchangeRates = await prisma.exchangeRate.findMany({
        where: {
            userId,
            deletedAt: null,
        },
    })

    // Build exchange rate map
    const rateMap: ExchangeRateMap = new Map()
    exchangeRates.forEach(rate => {
        const key = `${rate.fromCurrency}_TO_${rate.toCurrency}`
        rateMap.set(key, rate.rate)
    })

    // Calculate total spent in budget currency
    let totalSpent = new Prisma.Decimal(0)

    for (const transaction of transactions) {
        // The amount that went INTO the expense account
        // If transaction currency matches toAccount currency, use transaction amount
        // Otherwise, we need to convert using the exchange rate
        let amountInExpenseCurrency: Prisma.Decimal

        if (transaction.currency === transaction.toAccount.currency) {
            // Same currency transaction or the transaction is already in expense account currency
            amountInExpenseCurrency = transaction.amount
        } else if (transaction.exchangeRate) {
            // Cross-currency: calculate what went into the expense account
            // Transaction is in a different currency, need to convert to expense account currency
            const rate = transaction.exchangeRate
            amountInExpenseCurrency = transaction.amount.mul(rate)
        } else {
            // This shouldn't happen, but handle gracefully
            amountInExpenseCurrency = transaction.amount
        }

        // Convert from expense account currency to budget currency
        const amountInBudgetCurrency = convertAmount(
            amountInExpenseCurrency,
            transaction.toAccount.currency,
            budget.currency,
            rateMap
        )

        totalSpent = totalSpent.add(amountInBudgetCurrency)
    }

    const spent = Number(totalSpent)
    const budgetAmount = Number(budget.amount)
    const remaining = budgetAmount - spent
    const percentage = budgetAmount > 0 ? (spent / budgetAmount) * 100 : 0
    const isOverBudget = spent > budgetAmount

    return {
        budgetId: budget.id,
        budgetAmount,
        budgetCurrency: budget.currency,
        spent,
        remaining,
        percentage: Math.round(percentage * 100) / 100, // Round to 2 decimals
        isOverBudget,
    }
}

