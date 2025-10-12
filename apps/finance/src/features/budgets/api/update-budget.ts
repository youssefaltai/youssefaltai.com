import { prisma } from "@repo/db"
import { updateBudgetSchema, UpdateBudgetSchema } from "../validation"
import { validateAccountsOwnership } from "../../../shared/account-validators"
import { getBudget } from "./get-budget"

/**
 * Updates a budget.
 * 
 * Security: Verifies user owns the budget and all accounts.
 * 
 * @param userId - The authenticated user's ID
 * @param budgetId - The budget ID
 * @param input - Budget update data
 * @returns The updated budget with accounts included
 * @throws Error if validation fails, budget not found, or accounts are not expense type
 */
export async function updateBudget(
    userId: string,
    budgetId: string,
    input: UpdateBudgetSchema
) {
    // Validate the input
    const validated = updateBudgetSchema.parse(input)
    const { name, amount, currency, startDate, endDate, accountIds } = validated

    // Verify budget exists and user owns it
    await getBudget(userId, budgetId)

    // If accountIds provided, validate them
    if (accountIds) {
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
    }

    // Update budget in a transaction
    const budget = await prisma.$transaction(async (tx) => {
        // Update budget fields
        const updateData: any = {}
        if (name !== undefined) updateData.name = name
        if (amount !== undefined) updateData.amount = amount
        if (currency !== undefined) updateData.currency = currency
        if (startDate !== undefined) updateData.startDate = new Date(startDate)
        if (endDate !== undefined) updateData.endDate = new Date(endDate)

        await tx.budget.update({
            where: { id: budgetId },
            data: updateData,
        })

        // If accountIds provided, update budget_accounts
        if (accountIds) {
            // Delete existing budget_accounts
            await tx.budgetAccount.deleteMany({
                where: { budgetId },
            })

            // Create new budget_accounts
            await tx.budgetAccount.createMany({
                data: accountIds.map(accountId => ({
                    budgetId,
                    accountId,
                })),
            })
        }

        // Fetch and return updated budget with accounts
        return await tx.budget.findUnique({
            where: { id: budgetId },
            include: {
                accounts: {
                    where: {
                        deletedAt: null,
                    },
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

