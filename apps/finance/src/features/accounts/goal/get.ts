import { prisma, TAccount } from "@repo/db"
import { GOAL_OMIT_FIELDS } from "../../../shared/omit-fields"

/**
 * Gets a single goal account by ID.
 * 
 * @param accountId - Account ID to fetch
 * @param userId - User ID (for ownership validation)
 * @returns The goal account with target and dueDate
 */
export async function getGoal(
    accountId: string,
    userId: string
): Promise<TAccount> {
    const account = await prisma.account.findUnique({
        where: {
            id: accountId,
            userId,
            deletedAt: null,
        },
        omit: GOAL_OMIT_FIELDS,
    })

    if (!account) {
        throw new Error("Goal not found or you don't have permission to access it")
    }

    return account
}

