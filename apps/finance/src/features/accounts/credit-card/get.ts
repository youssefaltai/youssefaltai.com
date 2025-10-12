import { prisma, TAccount } from "@repo/db"
import { SIMPLE_ACCOUNT_OMIT_FIELDS } from "../../../shared/omit-fields"

/**
 * Gets a single credit card account by ID.
 * 
 * @param accountId - Account ID to fetch
 * @param userId - User ID (for ownership validation)
 * @returns The credit card account
 */
export async function getCreditCard(
    accountId: string,
    userId: string
): Promise<TAccount> {
    const account = await prisma.account.findUnique({
        where: {
            id: accountId,
            userId,
            deletedAt: null,
        },
        omit: SIMPLE_ACCOUNT_OMIT_FIELDS,
    })

    if (!account) {
        throw new Error("Credit card not found or you don't have permission to access it")
    }

    return account
}

