import { AccountType, Currency, Prisma, prisma, TAccount } from "@repo/db"
import { getOrCreateOpeningBalancesAccount } from "../../../shared/account-validators"
import { calculateCurrencyConversion } from "../../../shared/finance-utils"

interface CreateAccountInput {
    name: string
    description?: string
    currency: Currency
    type: AccountType
    openingBalance?: number
    openingBalanceExchangeRate?: number
    target?: number
    dueDate?: string
}

/**
 * Shared helper to create an account with optional opening balance.
 * Handles cross-currency opening balances with proper validation.
 * Used by all account type creation functions.
 * 
 * @param userId - User ID
 * @param input - Account creation data
 * @param omitFields - Fields to omit from response
 * @returns Created account
 */
export async function createAccountWithOpeningBalance(
    userId: string,
    input: CreateAccountInput,
    omitFields: Record<string, boolean> = {}
): Promise<TAccount> {
    const { name, description, currency, type, openingBalance, openingBalanceExchangeRate, target, dueDate } = input

    // Fetch user to get base currency
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { baseCurrency: true },
    })

    if (!user) {
        throw new Error("User not found")
    }

    // Get or create the Opening Balances account
    const openingBalances = await getOrCreateOpeningBalancesAccount(userId, user.baseCurrency)

    // Create the account and opening balance transaction in a database transaction
    const result = await prisma.$transaction(async (tx) => {
        // Create the account
        const account = await tx.account.create({
            data: {
                name,
                description,
                type,
                currency,
                target: target ? new Prisma.Decimal(target) : null,
                dueDate: dueDate ? new Date(dueDate) : null,
                userId,
            },
            omit: omitFields,
        })

        const openingBalanceDecimal = new Prisma.Decimal(openingBalance ?? 0)
        const shouldCreateOpeningBalance = openingBalanceDecimal.gt(0)

        // Create the opening balance transaction if needed
        if (shouldCreateOpeningBalance) {
            const isCrossCurrency = openingBalances.currency !== currency

            // Validate cross-currency requirements
            if (isCrossCurrency && !openingBalanceExchangeRate) {
                throw new Error(
                    `Exchange rate required for opening balance in ${currency} (user base currency is ${openingBalances.currency})`
                )
            }

            // Calculate currency conversion for opening balance
            const conversion = calculateCurrencyConversion({
                amount: openingBalanceDecimal,
                fromCurrency: openingBalances.currency,
                toCurrency: currency,
                providedCurrency: currency,
                providedExchangeRate: isCrossCurrency ? openingBalanceExchangeRate : null
            })

            console.log(`Creating ${type} account with opening balance:`, {
                userId,
                accountName: name,
                accountType: type,
                accountCurrency: currency,
                baseCurrency: openingBalances.currency,
                amount: openingBalanceDecimal.toString(),
                crossCurrency: isCrossCurrency,
                exchangeRate: conversion.exchangeRate?.toString() || 'N/A',
            })

            await tx.transaction.create({
                data: {
                    description: `Opening balance for ${name}`,
                    amount: openingBalanceDecimal,
                    currency: conversion.currency,
                    exchangeRate: conversion.exchangeRate,
                    fromAccountId: openingBalances.id,
                    toAccountId: account.id,
                    userId,
                },
            })

            // Update the opening balances account balance
            await tx.account.update({
                where: { id: openingBalances.id },
                data: { balance: { decrement: conversion.amountToDeduct } },
            })

            // Update the account balance
            const updatedAccount = await tx.account.update({
                where: { id: account.id },
                omit: omitFields,
                data: { balance: { increment: conversion.amountToIncrement } },
            })

            return updatedAccount
        }

        return account
    })

    return result
}

/**
 * Shared helper to update an account.
 * Handles common update logic for all account types.
 * 
 * @param accountId - Account ID to update
 * @param userId - User ID (for ownership validation)
 * @param updateData - Fields to update
 * @param omitFields - Fields to omit from response
 * @returns Updated account
 */
export async function updateAccountFields(
    accountId: string,
    userId: string,
    updateData: any,
    omitFields: Record<string, boolean> = {}
): Promise<TAccount> {
    const updatedAccount = await prisma.account.update({
        where: { id: accountId, userId },
        data: updateData,
        omit: omitFields,
    })

    return updatedAccount
}

