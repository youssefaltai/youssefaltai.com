import { TAccount } from "@repo/db"
import { updateLoanSchema, UpdateLoanSchema } from "./validation"
import { updateAccountFields } from "../shared/account-helpers"
import { LOAN_OMIT_FIELDS } from "../../../shared/omit-fields"

/**
 * Updates a loan account.
 * 
 * @param accountId - Account ID to update
 * @param userId - User ID (for ownership validation)
 * @param input - Partial update data
 * @returns Updated loan account
 */
export async function updateLoan(
    accountId: string,
    userId: string,
    input: UpdateLoanSchema
): Promise<TAccount> {
    const validated = updateLoanSchema.parse(input)

    const updateData: any = {}
    if (validated.name !== undefined) updateData.name = validated.name
    if (validated.description !== undefined) updateData.description = validated.description
    if (validated.currency !== undefined) updateData.currency = validated.currency
    if (validated.dueDate !== undefined) updateData.dueDate = new Date(validated.dueDate)

    return updateAccountFields(accountId, userId, updateData, LOAN_OMIT_FIELDS)
}

