/**
 * Get categories API handler
 */
import { prisma } from '@repo/db'

export async function getCategories(userId: string, type?: 'income' | 'expense') {
  // Fetch categories
  const categories = await prisma.category.findMany({
    where: {
      userId,
      ...(type && { type }),
    },
    orderBy: { name: 'asc' },
  })

  return categories
}

