import { TAccount } from "@repo/db"
import { createIncomeSourceSchema, CreateIncomeSourceSchema } from "./validation"
import { createAccountWithOpeningBalance } from "../shared/account-helpers"
import { SIMPLE_ACCOUNT_OMIT_FIELDS } from "../../../shared/omit-fields"

/**
 * Creates an income source account (salary, freelance, investments, etc.).
 * Opening balance represents historical income already earned.
 * 
 * @param userId - The authenticated user's ID
 * @param input - Income source data (name, description, currency, optional opening balance)
 * @returns The created income account
 * @throws Error if validation fails or exchange rate missing for cross-currency opening balance
 */
export async function createIncomeSource(
    userId: string,
    input: CreateIncomeSourceSchema
): Promise<TAccount> {
    const validated = createIncomeSourceSchema.parse(input)

    return createAccountWithOpeningBalance(
        userId,
        {
            ...validated,
            type: "income",
        },
        SIMPLE_ACCOUNT_OMIT_FIELDS
    )
}

