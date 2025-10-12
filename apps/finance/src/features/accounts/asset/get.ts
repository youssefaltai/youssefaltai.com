import { prisma, TAccount } from "@repo/db"
import { ASSET_ACCOUNT_OMIT_FIELDS } from "../../../shared/omit-fields"

/**
 * Gets a single asset account by ID.
 * 
 * @param accountId - Account ID to fetch
 * @param userId - User ID (for ownership validation)
 * @returns The asset account
 */
export async function getAssetAccount(
    accountId: string,
    userId: string
): Promise<TAccount> {
    const account = await prisma.account.findUnique({
        where: {
            id: accountId,
            userId,
            deletedAt: null,
        },
        omit: ASSET_ACCOUNT_OMIT_FIELDS,
    })

    if (!account) {
        throw new Error("Account not found or you don't have permission to access it")
    }

    return account
}

