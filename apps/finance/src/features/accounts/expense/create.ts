import { TAccount } from "@repo/db"
import { createExpenseCategorySchema, CreateExpenseCategorySchema } from "./validation"
import { createAccountWithOpeningBalance } from "../shared/account-helpers"
import { SIMPLE_ACCOUNT_OMIT_FIELDS } from "../../../shared/omit-fields"

/**
 * Creates an expense category account (groceries, rent, entertainment, etc.).
 * Opening balance represents historical expenses already spent.
 * 
 * @param userId - The authenticated user's ID
 * @param input - Expense category data (name, description, currency, optional opening balance)
 * @returns The created expense account
 * @throws Error if validation fails or exchange rate missing for cross-currency opening balance
 */
export async function createExpenseCategory(
    userId: string,
    input: CreateExpenseCategorySchema
): Promise<TAccount> {
    const validated = createExpenseCategorySchema.parse(input)

    return createAccountWithOpeningBalance(
        userId,
        {
            ...validated,
            type: "expense",
        },
        SIMPLE_ACCOUNT_OMIT_FIELDS
    )
}

