import { prisma, TAccount } from "@repo/db"
import { LOAN_OMIT_FIELDS } from "../../../shared/omit-fields"

/**
 * Gets a single loan account by ID.
 * 
 * @param accountId - Account ID to fetch
 * @param userId - User ID (for ownership validation)
 * @returns The loan account with dueDate
 */
export async function getLoan(
    accountId: string,
    userId: string
): Promise<TAccount> {
    const account = await prisma.account.findUnique({
        where: {
            id: accountId,
            userId,
            deletedAt: null,
        },
        omit: LOAN_OMIT_FIELDS,
    })

    if (!account) {
        throw new Error("Loan not found or you don't have permission to access it")
    }

    return account
}

