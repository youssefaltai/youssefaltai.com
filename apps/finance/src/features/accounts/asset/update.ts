import { TAccount } from "@repo/db"
import { updateAssetAccountSchema, UpdateAssetAccountSchema } from "./validation"
import { updateAccountFields } from "../shared/account-helpers"
import { ASSET_ACCOUNT_OMIT_FIELDS } from "../../../shared/omit-fields"

/**
 * Updates an asset account.
 * 
 * @param accountId - Account ID to update
 * @param userId - User ID (for ownership validation)
 * @param input - Partial update data
 * @returns Updated asset account
 */
export async function updateAssetAccount(
    accountId: string,
    userId: string,
    input: UpdateAssetAccountSchema
): Promise<TAccount> {
    const validated = updateAssetAccountSchema.parse(input)

    const updateData: any = {}
    if (validated.name !== undefined) updateData.name = validated.name
    if (validated.description !== undefined) updateData.description = validated.description
    if (validated.currency !== undefined) updateData.currency = validated.currency

    return updateAccountFields(accountId, userId, updateData, ASSET_ACCOUNT_OMIT_FIELDS)
}

