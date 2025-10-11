/**
 * Create category API handler
 */
import { prisma } from '@repo/db'
import { CreateCategorySchema, type CreateCategoryInput } from '../validation'

export async function createCategory(userId: string, data: CreateCategoryInput) {
  // Validate input
  const validatedData = CreateCategorySchema.parse(data)

  // Check if category name already exists for this user
  const existing = await prisma.category.findUnique({
    where: {
      userId_name: {
        userId,
        name: validatedData.name,
      },
    },
  })

  if (existing) {
    throw new Error('Category name already exists')
  }

  // Create category
  const category = await prisma.category.create({
    data: {
      userId,
      name: validatedData.name,
      type: validatedData.type,
    },
  })

  return category
}

