/**
 * Update budget API handler
 */
import { prisma } from '@repo/db'
import { UpdateBudgetSchema, type UpdateBudgetInput } from '../validation'

export async function updateBudget(
  userId: string,
  budgetId: string,
  data: UpdateBudgetInput
) {
  // Validate input
  const validatedData = UpdateBudgetSchema.parse(data)

  // Check if budget exists and belongs to user
  const existing = await prisma.budget.findFirst({
    where: { id: budgetId, userId },
  })

  if (!existing) {
    throw new Error('Budget not found or unauthorized')
  }

  // Prepare update data
  const updateData: any = {}
  
  if (validatedData.name !== undefined) updateData.name = validatedData.name
  if (validatedData.amount !== undefined) updateData.amount = validatedData.amount
  if (validatedData.currency !== undefined) updateData.currency = validatedData.currency
  if (validatedData.categories !== undefined) updateData.categories = validatedData.categories
  if (validatedData.startDate !== undefined) updateData.startDate = new Date(validatedData.startDate)
  if (validatedData.endDate !== undefined) updateData.endDate = new Date(validatedData.endDate)

  // Update budget
  const budget = await prisma.budget.update({
    where: { id: budgetId },
    data: updateData,
  })

  return budget
}

