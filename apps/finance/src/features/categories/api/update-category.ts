/**
 * Update category API handler
 */
import { prisma } from '@repo/db'
import { UpdateCategorySchema, type UpdateCategoryInput } from '../validation'

export async function updateCategory(
  userId: string,
  categoryId: string,
  data: UpdateCategoryInput
) {
  // Validate input
  const validatedData = UpdateCategorySchema.parse(data)

  // Verify ownership
  const existing = await prisma.category.findFirst({
    where: {
      id: categoryId,
      userId,
    },
  })

  if (!existing) {
    throw new Error('Category not found or unauthorized')
  }

  // If name is being changed, check for duplicates
  if (validatedData.name && validatedData.name !== existing.name) {
    const duplicate = await prisma.category.findUnique({
      where: {
        userId_name: {
          userId,
          name: validatedData.name,
        },
      },
    })

    if (duplicate) {
      throw new Error('Category name already exists')
    }
  }

  // Update category
  const category = await prisma.category.update({
    where: { id: categoryId },
    data: validatedData,
  })

  return category
}

