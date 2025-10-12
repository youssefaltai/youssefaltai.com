import { prisma, TAccount } from "@repo/db"
import { ASSET_ACCOUNT_OMIT_FIELDS } from "../../../shared/omit-fields"

/**
 * Gets all asset accounts for a user.
 * Returns only asset accounts (excluding goals which have target/dueDate).
 * 
 * @param userId - User ID
 * @returns Array of asset accounts
 */
export async function getAllAssetAccounts(userId: string): Promise<TAccount[]> {
    const accounts = await prisma.account.findMany({
        where: {
            type: "asset",
            target: null,
            dueDate: null,
            deletedAt: null,
            userId,
        },
        omit: ASSET_ACCOUNT_OMIT_FIELDS,
        orderBy: {
            createdAt: "desc",
        },
    })

    return accounts
}

