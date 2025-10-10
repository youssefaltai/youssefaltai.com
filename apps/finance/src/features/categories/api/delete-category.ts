/**
 * Delete category API handler
 */
import { prisma } from '@repo/db'

export async function deleteCategory(userId: string, categoryId: string) {
  // Verify ownership and delete
  const category = await prisma.category.deleteMany({
    where: {
      id: categoryId,
      userId, // Ensure user owns this category
    },
  })

  if (category.count === 0) {
    throw new Error('Category not found or unauthorized')
  }

  return { success: true }
}

