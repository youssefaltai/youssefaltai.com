import { prisma, TAccount } from "@repo/db"
import { SIMPLE_ACCOUNT_OMIT_FIELDS } from "../../../shared/omit-fields"

/**
 * Gets all credit card accounts for a user.
 * Returns only credit cards (liabilities without dueDate).
 * 
 * @param userId - User ID
 * @returns Array of credit cards
 */
export async function getAllCreditCards(userId: string): Promise<TAccount[]> {
    const accounts = await prisma.account.findMany({
        where: {
            type: "liability",
            dueDate: null,
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

