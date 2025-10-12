import { createTransactionSchema, CreateTransactionSchema } from "../validation"
import { prisma, TTransaction } from "@repo/db"
import { validateAccountsOwnership } from "../../../shared/account-validators"
import { calculateCurrencyConversion } from "../../../shared/finance-utils"
import { TRANSACTION_OMIT_FIELDS } from "../../../shared/omit-fields"
import getExchangeRates from "../../exchange-rates/api/get-exchange-rates"

/**
 * Creates a new transaction and updates account balances accordingly.
 * 
 * Security: Validates user owns both accounts and they exist.
 * Data Integrity: Properly handles exchange rates for cross-currency transactions.
 * 
 * @param userId - The authenticated user's ID
 * @param input - Transaction data (description, accounts, amount, optional currency & exchangeRate)
 * @returns The created transaction
 * @throws Error if accounts invalid, exchange rate missing for cross-currency, or validation fails
 * 
 * Note: For same-currency transactions:
 *       - Currency is optional (automatically uses account currency)
 *       - Exchange rate is not needed (will be null)
 *       For cross-currency transactions:
 *       - Currency is optional (uses account currency)
 *       - Exchange rate is optional (fetches from user's saved rates if not provided)
 */
export default async function createTransaction(userId: string, input: CreateTransactionSchema): Promise<TTransaction> {
    // Validate the input
    const validated = createTransactionSchema.parse(input)
    let { description, amount, currency, fromAccountId, toAccountId, exchangeRate, date } = validated;

    // Validate accounts ownership
    const accountMap = await validateAccountsOwnership([fromAccountId, toAccountId], userId)
    const fromAccount = accountMap.get(fromAccountId)!
    const toAccount = accountMap.get(toAccountId)!

    // For cross-currency transactions, fetch default exchange rate if not provided
    if (fromAccount.currency !== toAccount.currency && !exchangeRate) {
        // Default to fromAccount currency if not specified
        if (!currency) {
            currency = fromAccount.currency
        }
        
        // Determine which rate to fetch based on transaction currency
        const fromCurrency = currency === fromAccount.currency ? fromAccount.currency : toAccount.currency
        const toCurrency = currency === fromAccount.currency ? toAccount.currency : fromAccount.currency
        
        const rates = await getExchangeRates(userId, fromCurrency, toCurrency)
        
        const defaultRate = rates[0]
        if (!defaultRate) {
            throw new Error(
                `No exchange rate found for ${fromCurrency} to ${toCurrency}. ` +
                `Please set a default rate in Settings or provide an exchange rate.`
            )
        }
        
        exchangeRate = Number(defaultRate.rate)
        console.log(`Using default exchange rate for ${fromCurrency}→${toCurrency}: ${exchangeRate}`)
    }

    // Calculate currency conversion amounts
    const conversion = calculateCurrencyConversion({
        amount,
        fromCurrency: fromAccount.currency,
        toCurrency: toAccount.currency,
        providedCurrency: currency,
        providedExchangeRate: exchangeRate, // Will be fetched default or user-provided
    })

    console.log('Creating transaction:', {
        userId,
        fromAccountId,
        toAccountId,
        amount,
        currency: conversion.currency,
        exchangeRate: conversion.exchangeRate?.toString(),
        crossCurrency: fromAccount.currency !== toAccount.currency,
    })

    // Create the transaction in a database transaction
    const result = await prisma.$transaction(async (tx) => {
        const transaction = await tx.transaction.create({
            data: {
                description,
                fromAccountId,
                toAccountId,
                amount,
                currency: conversion.currency,
                exchangeRate: conversion.exchangeRate,
                date,
                userId,
            },
            omit: TRANSACTION_OMIT_FIELDS,
        })

        // update the from account balance
        await tx.account.update({
            where: { id: fromAccount.id },
            data: { balance: { decrement: conversion.amountToDeduct } },
        })

        // update the to account balance
        await tx.account.update({
            where: { id: toAccount.id },
            data: { balance: { increment: conversion.amountToIncrement } },
        })

        console.log('Transaction created successfully:', {
            transactionId: transaction.id,
            userId,
            fromAccountBalance: 'updated',
            toAccountBalance: 'updated',
        })

        // Re-fetch the transaction with updated account balances
        const transactionWithAccounts = await tx.transaction.findUnique({
            where: { id: transaction.id },
            include: {
                fromAccount: {
                    select: {
                        id: true,
                        name: true,
                        currency: true,
                        balance: true,
                        description: true,
                    },
                },
                toAccount: {
                    select: {
                        id: true,
                        name: true,
                        currency: true,
                        balance: true,
                        description: true,
                    },
                }
            },
            omit: TRANSACTION_OMIT_FIELDS,
        })

        return transactionWithAccounts!
    })

    return result
}