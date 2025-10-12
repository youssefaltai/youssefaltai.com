import { TAccount } from "@repo/db"
import { updateCreditCardSchema, UpdateCreditCardSchema } from "./validation"
import { updateAccountFields } from "../shared/account-helpers"
import { SIMPLE_ACCOUNT_OMIT_FIELDS } from "../../../shared/omit-fields"

/**
 * Updates a credit card account.
 * 
 * @param accountId - Account ID to update
 * @param userId - User ID (for ownership validation)
 * @param input - Partial update data
 * @returns Updated credit card account
 */
export async function updateCreditCard(
    accountId: string,
    userId: string,
    input: UpdateCreditCardSchema
): Promise<TAccount> {
    const validated = updateCreditCardSchema.parse(input)

    const updateData: any = {}
    if (validated.name !== undefined) updateData.name = validated.name
    if (validated.description !== undefined) updateData.description = validated.description
    if (validated.currency !== undefined) updateData.currency = validated.currency

    return updateAccountFields(accountId, userId, updateData, SIMPLE_ACCOUNT_OMIT_FIELDS)
}

