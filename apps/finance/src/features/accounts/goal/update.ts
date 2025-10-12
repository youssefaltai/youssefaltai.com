import { Prisma, TAccount } from "@repo/db"
import { updateGoalSchema, UpdateGoalSchema } from "./validation"
import { updateAccountFields } from "../shared/account-helpers"
import { GOAL_OMIT_FIELDS } from "../../../shared/omit-fields"

/**
 * Updates a goal account.
 * 
 * @param accountId - Account ID to update
 * @param userId - User ID (for ownership validation)
 * @param input - Partial update data
 * @returns Updated goal account
 */
export async function updateGoal(
    accountId: string,
    userId: string,
    input: UpdateGoalSchema
): Promise<TAccount> {
    const validated = updateGoalSchema.parse(input)

    const updateData: any = {}
    if (validated.name !== undefined) updateData.name = validated.name
    if (validated.description !== undefined) updateData.description = validated.description
    if (validated.currency !== undefined) updateData.currency = validated.currency
    if (validated.target !== undefined) updateData.target = new Prisma.Decimal(validated.target)
    if (validated.dueDate !== undefined) updateData.dueDate = new Date(validated.dueDate)

    return updateAccountFields(accountId, userId, updateData, GOAL_OMIT_FIELDS)
}

