/**
 * Get budgets API handler with spending calculations
 */
import { prisma } from '@repo/db'
import type { BudgetFilters } from '../validation'
import type { Budget } from '@repo/types'

export async function getBudgets(
  userId: string, 
  filters: BudgetFilters = {}
): Promise<Budget[]> {
  // Build where clause
  const where: any = { userId }

  // Date filters - find budgets that overlap with the filter range
  if (filters.dateFrom || filters.dateTo) {
    where.OR = [
      // Budget starts within range
      {
        startDate: {
          ...(filters.dateFrom && { gte: new Date(filters.dateFrom) }),
          ...(filters.dateTo && { lte: new Date(filters.dateTo) }),
        },
      },
      // Budget ends within range
      {
        endDate: {
          ...(filters.dateFrom && { gte: new Date(filters.dateFrom) }),
          ...(filters.dateTo && { lte: new Date(filters.dateTo) }),
        },
      },
      // Budget spans the entire range
      {
        AND: [
          ...(filters.dateFrom ? [{ startDate: { lte: new Date(filters.dateFrom) } }] : []),
          ...(filters.dateTo ? [{ endDate: { gte: new Date(filters.dateTo) } }] : []),
        ],
      },
    ]
  }

  // Fetch budgets
  const budgets = await prisma.budget.findMany({
    where,
    orderBy: {
      startDate: 'desc',
    },
  })

  // Calculate spending for each budget
  const budgetsWithSpending = await Promise.all(
    budgets.map(async (budget) => {
      // Filter by categories if specified
      if (filters.categories && filters.categories.length > 0) {
        const hasMatchingCategory = budget.categories.some((cat) =>
          filters.categories?.includes(cat)
        )
        if (!hasMatchingCategory) {
          return null
        }
      }

      // Calculate spent amount
      const transactions = await prisma.transaction.findMany({
        where: {
          userId,
          type: 'expense', // Only count expenses
          category: {
            in: budget.categories,
          },
          date: {
            gte: budget.startDate,
            lte: budget.endDate,
          },
        },
      })

      const spent = transactions.reduce(
        (sum, transaction) => sum + Number(transaction.baseAmount),
        0
      )

      return {
        id: budget.id,
        userId: budget.userId,
        name: budget.name,
        amount: Number(budget.amount),
        currency: budget.currency,
        categories: budget.categories,
        startDate: budget.startDate.toISOString(),
        endDate: budget.endDate.toISOString(),
        spent,
        remaining: Number(budget.amount) - spent,
        createdAt: budget.createdAt.toISOString(),
        updatedAt: budget.updatedAt.toISOString(),
      }
    })
  )

  // Filter out null values (budgets that didn't match category filter)
  return budgetsWithSpending.filter((b) => b !== null) as Budget[]
}

