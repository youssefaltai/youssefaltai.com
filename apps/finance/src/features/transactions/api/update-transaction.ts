import { updateTransactionSchema, UpdateTransactionSchema } from "../validation"
import { Prisma, prisma, TTransaction } from "@repo/db"
import { validateAccountsOwnership, validateDifferentAccounts } from "../../../shared/account-validators"
import { calculateCurrencyConversion, reverseCurrencyConversion } from "../../../shared/finance-utils"
import { TRANSACTION_OMIT_FIELDS } from "@/shared/omit-fields"

/**
 * Updates an existing transaction and adjusts account balances accordingly.
 * 
 * Security: Validates user owns both the transaction and the new accounts.
 * Data Integrity: Properly reverses old balances and applies new ones with correct exchange rates.
 * 
 * @param userId - The authenticated user's ID
 * @param transactionId - The transaction to update
 * @param input - Partial update data (all fields optional)
 * @returns The updated transaction
 * @throws Error if transaction not found, accounts invalid, or validation fails
 * 
 * Note: For same-currency transactions:
 *       - Currency is automatically set to account currency
 *       - Exchange rate is set to null (not needed)
 *       For cross-currency transactions:
 *       - Currency is required (must match one of the accounts)
 *       - Exchange rate is required
 */
export default async function updateTransaction(userId: string, transactionId: string, input: UpdateTransactionSchema): Promise<TTransaction> {
    // Validate input
    const validated = updateTransactionSchema.parse(input)
    const { description, amount, currency, fromAccountId, toAccountId, exchangeRate, date } = validated;

    // Fetch the existing transaction with account details
    const oldTransaction = await prisma.transaction.findUnique({
        where: { id: transactionId, deletedAt: null, userId },
        include: {
            fromAccount: true,
            toAccount: true,
        },
    })

    if (!oldTransaction) {
        console.error('Transaction not found or unauthorized:', { userId, transactionId })
        throw new Error("Transaction not found or you don't have permission to update it")
    }

    // Determine new values (use existing if not provided)
    const newDate = date ?? oldTransaction.date
    const newAmount = amount !== undefined ? new Prisma.Decimal(amount) : oldTransaction.amount
    const newExchangeRate = exchangeRate !== undefined ? new Prisma.Decimal(exchangeRate) : oldTransaction.exchangeRate
    const newCurrency = currency ?? oldTransaction.currency
    const newFromAccountId = fromAccountId ?? oldTransaction.fromAccountId
    const newToAccountId = toAccountId ?? oldTransaction.toAccountId
    const newDescription = description ?? oldTransaction.description

    // Validate: prevent same-account transfers
    validateDifferentAccounts(newFromAccountId, newToAccountId)

    // Validate accounts ownership
    const accountMap = await validateAccountsOwnership([newFromAccountId, newToAccountId], userId)
    const newFromAccount = accountMap.get(newFromAccountId)!
    const newToAccount = accountMap.get(newToAccountId)!

    // Calculate final currency conversion for new transaction
    const newConversion = calculateCurrencyConversion({
        amount: newAmount,
        fromCurrency: newFromAccount.currency,
        toCurrency: newToAccount.currency,
        providedCurrency: newCurrency,
        providedExchangeRate: newExchangeRate,
    })

    console.log('Updating transaction:', {
        userId,
        transactionId,
        changes: {
            amount: amount !== undefined,
            accounts: fromAccountId !== undefined || toAccountId !== undefined,
            exchangeRate: exchangeRate !== undefined,
            currency: currency !== undefined,
            date: date !== undefined,
            description: description !== undefined,
        }
    })

    // Perform the update in a database transaction
    const result = await prisma.$transaction(async (tx) => {
        // Step 1: Reverse the old transaction from old accounts
        const { amountToRestore: oldAmountToRestore, amountToRemove: oldAmountToRemove } = reverseCurrencyConversion(
            oldTransaction.amount,
            oldTransaction.currency,
            oldTransaction.fromAccount.currency,
            oldTransaction.toAccount.currency,
            oldTransaction.exchangeRate
        )

        // Reverse from old fromAccount (add back what was deducted)
        await tx.account.update({
            where: { id: oldTransaction.fromAccountId },
            data: { balance: { increment: oldAmountToRestore } },
        })

        // Reverse from old toAccount (remove what was incremented)
        await tx.account.update({
            where: { id: oldTransaction.toAccountId },
            data: { balance: { decrement: oldAmountToRemove } },
        })

        console.log('Reversed old transaction:', {
            fromAccountId: oldTransaction.fromAccountId,
            toAccountId: oldTransaction.toAccountId,
            amount: oldTransaction.amount.toString(),
            currency: oldTransaction.currency,
            exchangeRate: oldTransaction.exchangeRate?.toString(),
            amountToRestore: oldAmountToRestore.toString(),
            amountToRemove: oldAmountToRemove.toString(),
        })

        // Step 2: Apply the new transaction to new accounts
        await tx.account.update({
            where: { id: newFromAccountId },
            data: { balance: { decrement: newConversion.amountToDeduct } },
        })

        await tx.account.update({
            where: { id: newToAccountId },
            data: { balance: { increment: newConversion.amountToIncrement } },
        })

        console.log('Applied new transaction:', {
            fromAccountId: newFromAccountId,
            toAccountId: newToAccountId,
            amount: newAmount.toString(),
            currency: newConversion.currency,
            exchangeRate: newConversion.exchangeRate?.toString(),
            amountToDeduct: newConversion.amountToDeduct.toString(),
            amountToIncrement: newConversion.amountToIncrement.toString(),
        })

        // Step 3: Update the transaction record
        await tx.transaction.update({
            where: { id: transactionId },
            data: {
                description: newDescription,
                amount: newAmount,
                currency: newConversion.currency,
                fromAccountId: newFromAccountId,
                toAccountId: newToAccountId,
                exchangeRate: newConversion.exchangeRate,
                date: newDate,
            },
        })

        console.log('Transaction updated successfully:', {
            transactionId,
            userId,
        })

        // Re-fetch the transaction with updated account balances
        const transactionWithAccounts = await tx.transaction.findUnique({
            where: { id: transactionId },
            include: {
                fromAccount: {
                    select: {
                        id: true,
                        name: true,
                        currency: true,
                        balance: true,
                    },
                },
                toAccount: {
                    select: {
                        id: true,
                        name: true,
                        currency: true,
                        balance: true,
                    },
                },
            },
            omit: TRANSACTION_OMIT_FIELDS,
        })

        return transactionWithAccounts!
    })

    return result
}