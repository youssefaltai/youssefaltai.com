import { prisma } from "@repo/db"
import { createBudgetSchema, CreateBudgetSchema } from "../validation"
import { validateAccountsOwnership } from "../../../shared/account-validators"

/**
 * Creates a new budget with selected expense accounts.
 * 
 * Security: Validates user owns all accounts and they are expense type.
 * 
 * @param userId - The authenticated user's ID
 * @param input - Budget data (name, amount, currency, date range, accountIds)
 * @returns The created budget with accounts included
 * @throws Error if validation fails or accounts are not expense type
 */
export async function createBudget(userId: string, input: CreateBudgetSchema) {
    // Validate the input
    const validated = createBudgetSchema.parse(input)
    const { name, amount, currency, startDate, endDate, accountIds } = validated

    // Validate accounts ownership
    const accountMap = await validateAccountsOwnership(accountIds, userId)

    // Validate all accounts are expense type
    const nonExpenseAccounts = Array.from(accountMap.values()).filter(
        account => account.type !== 'expense'
    )
    if (nonExpenseAccounts.length > 0) {
        throw new Error(
            `Only expense accounts can be added to budgets. Found non-expense accounts: ${
                nonExpenseAccounts.map(a => a.name).join(', ')
            }`
        )
    }

    // Create budget with budget_accounts in a transaction
    const budget = await prisma.$transaction(async (tx) => {
        const newBudget = await tx.budget.create({
            data: {
                name,
                amount,
                currency,
                startDate: new Date(startDate),
                endDate: new Date(endDate),
                userId,
            },
        })

        // Create budget_accounts junction records
        await tx.budgetAccount.createMany({
            data: accountIds.map(accountId => ({
                budgetId: newBudget.id,
                accountId,
            })),
        })

        // Fetch and return budget with accounts
        return await tx.budget.findUnique({
            where: { id: newBudget.id },
            include: {
                accounts: {
                    include: {
                        account: {
                            select: {
                                id: true,
                                name: true,
                                type: true,
                                currency: true,
                            },
                        },
                    },
                },
            },
        })
    })

    return budget
}

