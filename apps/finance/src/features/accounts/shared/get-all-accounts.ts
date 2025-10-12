import { prisma, TAccount, AccountType } from "@repo/db"

/**
 * Gets all accounts for a user, optionally filtered by type.
 * Excludes soft-deleted accounts.
 * 
 * @param userId - User ID
 * @param type - Optional account type filter
 * @returns Array of accounts
 */
export async function getAllAccounts(userId: string, type?: AccountType): Promise<TAccount[]> {
    const accounts = await prisma.account.findMany({
        where: {
            userId,
            deletedAt: null,
            ...(type && { type }),
        },
        orderBy: {
            createdAt: "desc",
        },
    })

    return accounts
}

