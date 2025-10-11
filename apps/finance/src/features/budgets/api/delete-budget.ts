/**
 * Delete budget API handler
 */
import { prisma } from '@repo/db'

export async function deleteBudget(userId: string, budgetId: string) {
  // Check if budget exists and belongs to user
  const existing = await prisma.budget.findFirst({
    where: { id: budgetId, userId },
  })

  if (!existing) {
    throw new Error('Budget not found or unauthorized')
  }

  // Delete budget
  await prisma.budget.delete({
    where: { id: budgetId },
  })

  return { success: true }
}

