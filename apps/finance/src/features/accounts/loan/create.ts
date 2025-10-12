import { TAccount } from "@repo/db"
import { createLoanSchema, CreateLoanSchema } from "./validation"
import { createAccountWithOpeningBalance } from "../shared/account-helpers"
import { LOAN_OMIT_FIELDS } from "../../../shared/omit-fields"

/**
 * Creates a loan account (liability with payoff due date).
 * Opening balance represents the amount owed.
 * 
 * @param userId - The authenticated user's ID
 * @param input - Loan data (name, description, currency, dueDate, optional opening balance)
 * @returns The created loan account
 * @throws Error if validation fails or exchange rate missing for cross-currency opening balance
 */
export async function createLoan(
    userId: string,
    input: CreateLoanSchema
): Promise<TAccount> {
    const validated = createLoanSchema.parse(input)

    return createAccountWithOpeningBalance(
        userId,
        {
            ...validated,
            type: "liability",
        },
        LOAN_OMIT_FIELDS
    )
}

