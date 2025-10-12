import { prisma, TAccount } from "@repo/db"
import { GOAL_OMIT_FIELDS } from "../../../shared/omit-fields"

/**
 * Gets all goal accounts for a user.
 * Returns only goals (assets with target and dueDate).
 * 
 * @param userId - User ID
 * @returns Array of goals
 */
export async function getAllGoals(userId: string): Promise<TAccount[]> {
    const accounts = await prisma.account.findMany({
        where: {
            type: "asset",
            target: { not: null },
            dueDate: { not: null },
            deletedAt: null,
            userId,
        },
        omit: GOAL_OMIT_FIELDS,
        orderBy: {
            createdAt: "desc",
        },
    })

    return accounts
}

