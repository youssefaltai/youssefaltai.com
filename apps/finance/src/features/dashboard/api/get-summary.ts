/**
 * Get financial summary API handler
 */
import { prisma, Prisma } from '@repo/db'
import { currentMonthRange } from '@repo/utils'

interface GetSummaryOptions {
  dateFrom?: Date
  dateTo?: Date
}

export async function getSummary(userId: string, options: GetSummaryOptions = {}) {
  // Parse date range (default to current month)
  const monthRange = currentMonthRange()
  const dateFrom = options.dateFrom || monthRange.start
  const dateTo = options.dateTo || monthRange.end

  // Build query condition
  const where: Prisma.TransactionWhereInput = {
    userId,
    date: {
      gte: dateFrom,
      lte: dateTo,
    },
  }

  // Get all transactions in date range
  const transactions = await prisma.transaction.findMany({
    where,
    orderBy: { date: 'desc' },
  })

  // Calculate totals (all in base currency)
  const income = transactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + Number(t.baseAmount), 0)

  const expenses = transactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + Number(t.baseAmount), 0)

  const balance = income - expenses

  // Get category breakdown
  const categoryMap = new Map<string, { name: string; amount: number; type: string }>()

  transactions.forEach((t) => {
    const existing = categoryMap.get(t.category) || { name: t.category, amount: 0, type: t.type }
    existing.amount += Number(t.baseAmount)
    categoryMap.set(t.category, existing)
  })

  const categoryBreakdown = Array.from(categoryMap.values()).sort((a, b) => b.amount - a.amount)

  // Get currency breakdown (what currencies were used)
  const currencyMap = new Map<
    string,
    { currency: string; count: number; totalOriginal: number }
  >()

  transactions.forEach((t) => {
    const existing = currencyMap.get(t.currency) || {
      currency: t.currency,
      count: 0,
      totalOriginal: 0,
    }
    existing.count += 1
    existing.totalOriginal += Number(t.amount)
    currencyMap.set(t.currency, existing)
  })

  const currencyBreakdown = Array.from(currencyMap.values()).sort((a, b) => b.count - a.count)

  // Get base currency from user settings
  const userSettings = await prisma.userSettings.findUnique({
    where: { userId },
  })

  return {
    summary: {
      dateFrom,
      dateTo,
      baseCurrency: userSettings?.baseCurrency || 'EGP',
      income,
      expenses,
      balance,
      transactionCount: transactions.length,
    },
    categoryBreakdown,
    currencyBreakdown,
    recentTransactions: transactions.slice(0, 5), // Last 5 transactions
  }
}

