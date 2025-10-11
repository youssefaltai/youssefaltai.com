/**
 * Create budget API handler
 */
import { prisma } from '@repo/db'
import { CreateBudgetSchema, type CreateBudgetInput } from '../validation'

export async function createBudget(userId: string, data: CreateBudgetInput) {
  // Validate input
  const validatedData = CreateBudgetSchema.parse(data)

  // Create budget
  const budget = await prisma.budget.create({
    data: {
      userId,
      name: validatedData.name,
      amount: validatedData.amount,
      currency: validatedData.currency,
      categories: validatedData.categories,
      startDate: new Date(validatedData.startDate),
      endDate: new Date(validatedData.endDate),
    },
  })

  return budget
}

