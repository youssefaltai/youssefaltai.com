import { prisma, TTransaction } from "@repo/db"
import { reverseCurrencyConversion } from "../../../shared/finance-utils"

/**
 * Soft-deletes a transaction and reverses its effect on account balances.
 * 
 * Security: Validates user owns the transaction.
 * Data Integrity: Properly reverses balance changes with correct exchange rates.
 * 
 * @param userId - The authenticated user's ID
 * @param transactionId - The transaction to delete
 * @returns The deleted transaction
 * @throws Error if transaction not found or user unauthorized
 */
export default async function deleteTransaction(userId: string, transactionId: string): Promise<TTransaction> {
    // Fetch and validate ownership
    const transaction = await prisma.transaction.findUnique({
        where: {
            id: transactionId,
            deletedAt: null,
            userId,
        },
        include: {
            fromAccount: true,
            toAccount: true,
        },
    })

    if (!transaction) {
        console.error('Transaction not found or unauthorized:', { userId, transactionId })
        throw new Error("Transaction not found or you don't have permission to delete it")
    }

    console.log('Deleting transaction:', {
        userId,
        transactionId,
        fromAccountId: transaction.fromAccountId,
        toAccountId: transaction.toAccountId,
        amount: transaction.amount.toString(),
    })

    const result = await prisma.$transaction(async (tx) => {
        // Calculate the amounts to reverse
        const { amountToRestore, amountToRemove } = reverseCurrencyConversion(
            transaction.amount,
            transaction.currency,
            transaction.fromAccount.currency,
            transaction.toAccount.currency,
            transaction.exchangeRate
        )

        // Reverse the transaction in the from account (restore what was deducted)
        await tx.account.update({
            where: { id: transaction.fromAccountId },
            data: { balance: { increment: amountToRestore } },
        })

        // Reverse the transaction in the to account (remove what was incremented)
        await tx.account.update({
            where: { id: transaction.toAccountId },
            data: { balance: { decrement: amountToRemove } },
        })

        console.log('Reversed transaction balances:', {
            fromAccountId: transaction.fromAccountId,
            toAccountId: transaction.toAccountId,
            amount: transaction.amount.toString(),
            currency: transaction.currency,
            exchangeRate: transaction.exchangeRate?.toString(),
            amountToRestore: amountToRestore.toString(),
            amountToRemove: amountToRemove.toString(),
        })

        // soft-delete the transaction
        await tx.transaction.update({
            where: { id: transactionId },
            data: { deletedAt: new Date() },
        })

        console.log('Transaction deleted successfully:', {
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
                        description: true,
                        currency: true,
                        balance: true,
                    }
                },
                toAccount: {
                    select: {
                        id: true,
                        name: true,
                        description: true,
                        currency: true,
                        balance: true,
                    },
                }
            },
        })

        return transactionWithAccounts!
    })

    return result
}