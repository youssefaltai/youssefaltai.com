import { prisma } from "@repo/db"

/**
 * Fetches all budgets for a user.
 * 
 * @param userId - The authenticated user's ID
 * @returns Array of budgets with accounts included, ordered by start date (newest first)
 */
export async function getAllBudgets(userId: string) {
    const budgets = await prisma.budget.findMany({
        where: {
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
        orderBy: {
            startDate: 'desc',
        },
    })

    return budgets
}

