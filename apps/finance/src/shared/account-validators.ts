import { Account, Currency, prisma } from "@repo/db"

/**
 * Validates that accounts exist, belong to the user, and are not deleted.
 * 
 * @param accountIds - Array of account IDs to validate
 * @param userId - User ID to verify ownership
 * @returns Map of account ID to account object
 * @throws Error if any account is missing or unauthorized
 */
export async function validateAccountsOwnership(
  accountIds: string[],
  userId: string
): Promise<Map<string, Account>> {
  const uniqueIds = Array.from(new Set(accountIds))
  
  const accounts = await prisma.account.findMany({
    where: {
      id: { in: uniqueIds },
      userId,
      deletedAt: null,
    },
  })

  if (accounts.length !== uniqueIds.length) {
    const foundIds = new Set(accounts.map(a => a.id))
    const missingIds = uniqueIds.filter(id => !foundIds.has(id))
    console.error('Invalid or unauthorized accounts:', { userId, missingIds })
    throw new Error("One or more accounts not found or you don't have permission to use them")
  }

  return new Map(accounts.map(a => [a.id, a]))
}

/**
 * Fetches or creates the "Opening Balances" equity account for a user.
 * This account is used to balance opening balances when creating new accounts.
 * 
 * @param userId - User ID
 * @param baseCurrency - User's base currency
 * @returns The Opening Balances account
 */
export async function getOrCreateOpeningBalancesAccount(
  userId: string,
  baseCurrency: Currency
): Promise<Account> {
  let openingBalances = await prisma.account.findFirst({
    where: {
      name: "Opening Balances",
      description: "Opening balance for all accounts",
      type: "equity",
      userId,
    },
  })

  if (!openingBalances) {
    openingBalances = await prisma.account.create({
      data: {
        name: "Opening Balances",
        description: "Opening balance for all accounts",
        type: "equity",
        currency: baseCurrency,
        userId,
      },
    })
  }

  return openingBalances
}

/**
 * Validates that two accounts are different (prevents same-account transfers).
 * 
 * @param fromAccountId - Source account ID
 * @param toAccountId - Destination account ID
 * @throws Error if accounts are the same
 */
export function validateDifferentAccounts(fromAccountId: string, toAccountId: string): void {
  if (fromAccountId === toAccountId) {
    throw new Error("From and to accounts must be different")
  }
}

