import { prisma } from "@repo/db"

/**
 * Soft-deletes a credit card account.
 * 
 * @param accountId - Account ID to delete
 * @param userId - User ID (for ownership validation)
 * @returns Success message
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

    await prisma.account.update({
        where: { id: accountId },
        data: { deletedAt: new Date() },
    })

    return { message: 'Credit card deleted successfully' }
}

