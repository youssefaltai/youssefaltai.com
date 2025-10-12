import { prisma, TAccount } from "@repo/db"
import { SIMPLE_ACCOUNT_OMIT_FIELDS } from "../../../shared/omit-fields"

/**
 * Gets all expense category accounts for a user.
 * 
 * @param userId - User ID
 * @returns Array of expense categories
 */
export async function getAllExpenseCategories(userId: string): Promise<TAccount[]> {
    const accounts = await prisma.account.findMany({
        where: {
            type: "expense",
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

