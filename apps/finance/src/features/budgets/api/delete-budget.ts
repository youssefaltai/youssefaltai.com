import { prisma } from "@repo/db"
import { getBudget } from "./get-budget"

/**
 * Soft deletes a budget.
 * 
 * Security: Verifies user owns the budget.
 * 
 * @param userId - The authenticated user's ID
 * @param budgetId - The budget ID
 * @returns Success message
 * @throws Error if budget not found or user doesn't own it
 */
export async function deleteBudget(userId: string, budgetId: string) {
    // Verify budget exists and user owns it
    await getBudget(userId, budgetId)

    // Soft delete the budget
    await prisma.budget.update({
        where: { id: budgetId },
        data: { deletedAt: new Date() },
    })

    return { success: true, message: "Budget deleted successfully" }
}

