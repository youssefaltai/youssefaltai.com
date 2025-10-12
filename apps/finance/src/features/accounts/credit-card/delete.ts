import { prisma } from "@repo/db"

/**
 * Soft-deletes a credit card account.
 * Prevents deletion if account has active transactions.
 * 
 * @param accountId - Account ID to delete
 * @param userId - User ID (for ownership validation)
 * @returns Success message
 * @throws Error if account has transactions or user doesn't own it
 */
export async function deleteCreditCard(
    accountId: string,
    userId: string
): Promise<{ message: string }> {
    const account = await prisma.account.findUnique({
        where: {
            id: accountId,
            userId,
            deletedAt: null,
        },
    })

    if (!account) {
        throw new Error("Credit card not found or you don't have permission to delete it")
    }

    // Check for existing transactions
    const transactionCount = await prisma.transaction.count({
        where: {
            OR: [
                { fromAccountId: accountId },
                { toAccountId: accountId },
            ],
            deletedAt: null,
        },
    })

    if (transactionCount > 0) {
        throw new Error(
            `Cannot delete credit card with ${transactionCount} active transaction${transactionCount === 1 ? '' : 's'}. ` +
            `Please delete transactions first or keep account for history.`
        )
    }

    await prisma.account.update({
        where: { id: accountId },
        data: { deletedAt: new Date() },
    })

    return { message: 'Credit card deleted successfully' }
}

