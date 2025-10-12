import { TAccount } from "@repo/db"
import { updateIncomeSourceSchema, UpdateIncomeSourceSchema } from "./validation"
import { updateAccountFields } from "../shared/account-helpers"
import { SIMPLE_ACCOUNT_OMIT_FIELDS } from "../../../shared/omit-fields"

/**
 * Updates an income source account.
 * 
 * @param accountId - Account ID to update
 * @param userId - User ID (for ownership validation)
 * @param input - Partial update data
 * @returns Updated income account
 */
export async function updateIncomeSource(
    accountId: string,
    userId: string,
    input: UpdateIncomeSourceSchema
): Promise<TAccount> {
    const validated = updateIncomeSourceSchema.parse(input)

    const updateData: any = {}
    if (validated.name !== undefined) updateData.name = validated.name
    if (validated.description !== undefined) updateData.description = validated.description
    if (validated.currency !== undefined) updateData.currency = validated.currency

    return updateAccountFields(accountId, userId, updateData, SIMPLE_ACCOUNT_OMIT_FIELDS)
}

