/**
 * Get transactions API handler
 */
import { prisma, Prisma } from '@repo/db'
import { TransactionFiltersSchema, type TransactionFilters } from '../validation'

export async function getTransactions(userId: string, filters: Partial<TransactionFilters>) {
  // Validate filters
  const validatedFilters = TransactionFiltersSchema.parse(filters)

  // Build query conditions
  const where: Prisma.TransactionWhereInput = {
    userId,
    ...(validatedFilters.type && { type: validatedFilters.type }),
    ...(validatedFilters.category && { category: validatedFilters.category }),
    ...(validatedFilters.currency && { currency: validatedFilters.currency }),
    ...(validatedFilters.dateFrom || validatedFilters.dateTo
      ? {
          date: {
            ...(validatedFilters.dateFrom && { gte: new Date(validatedFilters.dateFrom) }),
            ...(validatedFilters.dateTo && { lte: new Date(validatedFilters.dateTo) }),
          },
        }
      : {}),
  }

  // Calculate pagination
  const page = validatedFilters.page || 1
  const limit = validatedFilters.limit || 50
  const skip = (page - 1) * limit

  // Fetch transactions
  const [transactions, total] = await Promise.all([
    prisma.transaction.findMany({
      where,
      orderBy: { date: 'desc' },
      skip,
      take: limit,
    }),
    prisma.transaction.count({ where }),
  ])

  return {
    transactions,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  }
}

