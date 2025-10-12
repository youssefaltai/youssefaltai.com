import { TAccount } from "@repo/db"
import { createCreditCardSchema, CreateCreditCardSchema } from "./validation"
import { createAccountWithOpeningBalance } from "../shared/account-helpers"
import { SIMPLE_ACCOUNT_OMIT_FIELDS } from "../../../shared/omit-fields"

/**
 * Creates a credit card account (liability).
 * Opening balance represents the current balance owed.
 * 
 * @param userId - The authenticated user's ID
 * @param input - Credit card data (name, description, currency, optional opening balance)
 * @returns The created credit card account
 * @throws Error if validation fails or exchange rate missing for cross-currency opening balance
 */
export async function createCreditCard(
    userId: string,
    input: CreateCreditCardSchema
): Promise<TAccount> {
    const validated = createCreditCardSchema.parse(input)

    return createAccountWithOpeningBalance(
        userId,
        {
            ...validated,
            type: "liability",
        },
        SIMPLE_ACCOUNT_OMIT_FIELDS
    )
}

