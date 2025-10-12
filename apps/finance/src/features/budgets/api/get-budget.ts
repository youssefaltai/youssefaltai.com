import { prisma } from "@repo/db"

/**
 * Fetches a single budget by ID.
 * 
 * Security: Verifies user owns the budget.
 * 
 * @param userId - The authenticated user's ID
 * @param budgetId - The budget ID
 * @returns The budget with accounts included
 * @throws Error if budget not found or user doesn't own it
 */
export async function getBudget(userId: string, budgetId: string) {
    const budget = await prisma.budget.findFirst({
        where: {
            id: budgetId,
            userId,
            deletedAt: null,
        },
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

    if (!budget) {
        throw new Error("Budget not found or you don't have permission to access it")
    }

    return budget
}

