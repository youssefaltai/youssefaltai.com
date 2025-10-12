import { prisma, TAccount } from "@repo/db"
import { LOAN_OMIT_FIELDS } from "../../../shared/omit-fields"

/**
 * Gets all loan accounts for a user.
 * Returns only loans (liabilities with dueDate).
 * 
 * @param userId - User ID
 * @returns Array of loans
 */
export async function getAllLoans(userId: string): Promise<TAccount[]> {
    const accounts = await prisma.account.findMany({
        where: {
            type: "liability",
            dueDate: { not: null },
            deletedAt: null,
            userId,
        },
        omit: LOAN_OMIT_FIELDS,
        orderBy: {
            createdAt: "desc",
        },
    })

    return accounts
}

