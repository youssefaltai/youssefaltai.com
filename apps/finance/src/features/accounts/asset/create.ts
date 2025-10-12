import { TAccount } from "@repo/db"
import { createAssetAccountSchema, CreateAssetAccountSchema } from "./validation"
import { createAccountWithOpeningBalance } from "../shared/account-helpers"
import { ASSET_ACCOUNT_OMIT_FIELDS } from "../../../shared/omit-fields"

/**
 * Creates an asset account (bank account, cash wallet, savings, etc.).
 * 
 * @param userId - The authenticated user's ID
 * @param input - Account data (name, description, currency, optional opening balance)
 * @returns The created asset account
 * @throws Error if validation fails or exchange rate missing for cross-currency opening balance
 */
export async function createAssetAccount(
    userId: string,
    input: CreateAssetAccountSchema
): Promise<TAccount> {
    const validated = createAssetAccountSchema.parse(input)

    return createAccountWithOpeningBalance(
        userId,
        {
            ...validated,
            type: "asset",
        },
        ASSET_ACCOUNT_OMIT_FIELDS
    )
}

