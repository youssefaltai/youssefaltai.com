import { TAccount } from "@repo/db"
import { createGoalSchema, CreateGoalSchema } from "./validation"
import { createAccountWithOpeningBalance } from "../shared/account-helpers"
import { GOAL_OMIT_FIELDS } from "../../../shared/omit-fields"

/**
 * Creates a goal account (savings goal with target amount and due date).
 * Goals are asset accounts with target and dueDate fields.
 * 
 * @param userId - The authenticated user's ID
 * @param input - Goal data (name, description, currency, target, dueDate, optional opening balance)
 * @returns The created goal account
 * @throws Error if validation fails or exchange rate missing for cross-currency opening balance
 */
export async function createGoal(
    userId: string,
    input: CreateGoalSchema
): Promise<TAccount> {
    const validated = createGoalSchema.parse(input)

    return createAccountWithOpeningBalance(
        userId,
        {
            ...validated,
            type: "asset",
        },
        GOAL_OMIT_FIELDS
    )
}

