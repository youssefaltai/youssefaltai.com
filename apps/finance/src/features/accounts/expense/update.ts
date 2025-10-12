import { TAccount } from "@repo/db"
import { updateExpenseCategorySchema, UpdateExpenseCategorySchema } from "./validation"
import { updateAccountFields } from "../shared/account-helpers"
import { SIMPLE_ACCOUNT_OMIT_FIELDS } from "../../../shared/omit-fields"

/**
 * Updates an expense category account.
 * 
 * @param accountId - Account ID to update
 * @param userId - User ID (for ownership validation)
 * @param input - Partial update data
 * @returns Updated expense account
 */
export async function updateExpenseCategory(
    accountId: string,
    userId: string,
    input: UpdateExpenseCategorySchema
): Promise<TAccount> {
    const validated = updateExpenseCategorySchema.parse(input)

    const updateData: Partial<UpdateExpenseCategorySchema> = {}
    if (validated.name !== undefined) updateData.name = validated.name
    if (validated.description !== undefined) updateData.description = validated.description
    if (validated.currency !== undefined) updateData.currency = validated.currency

    return updateAccountFields(accountId, userId, updateData, SIMPLE_ACCOUNT_OMIT_FIELDS)
}

