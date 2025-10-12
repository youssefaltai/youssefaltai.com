import { prisma, TAccount } from "@repo/db"
import { SIMPLE_ACCOUNT_OMIT_FIELDS } from "../../../shared/omit-fields"

/**
 * Gets all income source accounts for a user.
 * 
 * @param userId - User ID
 * @returns Array of income sources
 */
export async function getAllIncomeSources(userId: string): Promise<TAccount[]> {
    const accounts = await prisma.account.findMany({
        where: {
            type: "income",
            deletedAt: null,
            userId,
        },
        omit: SIMPLE_ACCOUNT_OMIT_FIELDS,
        orderBy: {
            createdAt: "desc",
        },
    })

    return accounts
}

