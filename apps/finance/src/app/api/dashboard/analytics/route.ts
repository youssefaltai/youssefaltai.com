import { NextRequest, NextResponse } from "next/server"
import { verifyAuth } from "@repo/auth/verify-auth"
import { ApiResponse } from "@repo/types"
import { UnauthorizedResponse, SuccessResponse, InternalServerErrorResponse, BadRequestResponse } from "@/shared/utils/api"
import { prisma, Currency } from "@repo/db"
import { startOfMonth, endOfMonth, subMonths, getDaysInMonth, parseISO, isValid } from "@repo/utils"
import { convertAmount, ExchangeRateMap } from "@/shared/finance-utils"

export interface DailySpending {
  date: string
  income: number
  expenses: number
}

export interface CategoryBreakdown {
  category: string
  amount: number
  percentage: number
  count: number
}

export interface MonthData {
  month: string // e.g., "Jan", "Feb", "Mar"
  income: number
  expenses: number
  savings: number
}

export interface MonthComparison {
  months: MonthData[] // Last 6 months
  thisMonth: {
    income: number
    expenses: number
    savings: number
  }
  lastMonth: {
    income: number
    expenses: number
    savings: number
  }
  change: {
    income: number // percentage
    expenses: number // percentage
    savings: number // percentage
  }
}

export interface DashboardAnalytics {
  spendingTrends: DailySpending[]
  categoryBreakdown: CategoryBreakdown[]
  monthComparison: MonthComparison
  savingsRate: number
}

/**
 * GET /api/dashboard/analytics
 * Returns comprehensive analytics for the dashboard
 * - Daily spending trends for current month
 * - Top expense categories with totals
 * - Month-over-month comparison
 * - Savings rate
 */
export async function GET(request: NextRequest): Promise<NextResponse<ApiResponse<DashboardAnalytics>>> {
  const { authenticated, userId } = await verifyAuth(request)
  if (!authenticated) return UnauthorizedResponse(userId)

  try {
    // Get month parameter (YYYY-MM format) or default to current month
    const monthParam = request.nextUrl.searchParams.get('month')
    let referenceDate = new Date()

    if (monthParam) {
      const parsed = parseISO(`${monthParam}-01`)
      if (!isValid(parsed)) {
        return BadRequestResponse<DashboardAnalytics>('Invalid month format. Use YYYY-MM')
      }
      referenceDate = parsed
    }

    // Get user's base currency and exchange rates
    const [user, exchangeRates] = await Promise.all([
      prisma.user.findUnique({
        where: { id: userId },
        select: { baseCurrency: true },
      }),
      prisma.exchangeRate.findMany({
        where: { userId, deletedAt: null },
        select: { fromCurrency: true, toCurrency: true, rate: true },
      }),
    ])

    if (!user) {
      return InternalServerErrorResponse<DashboardAnalytics>('User not found')
    }

    const baseCurrency = user.baseCurrency

    // Build exchange rate map
    const rateMap: ExchangeRateMap = new Map()
    for (const rate of exchangeRates) {
      const key = `${rate.fromCurrency}_TO_${rate.toCurrency}`
      rateMap.set(key, rate.rate)
    }

    const thisMonthStart = startOfMonth(referenceDate)
    const thisMonthEnd = endOfMonth(referenceDate)
    const lastMonthStart = startOfMonth(subMonths(referenceDate, 1))
    const lastMonthEnd = endOfMonth(subMonths(referenceDate, 1))

    // Fetch this month and last month transactions in parallel
    const [thisMonthTransactions, lastMonthTransactions] = await Promise.all([
      fetchTransactionsWithAccounts(userId, thisMonthStart, thisMonthEnd),
      fetchTransactionsWithAccounts(userId, lastMonthStart, lastMonthEnd),
    ])
    
    // Fetch 6 months of data with separate queries for better performance
    const monthlyData = await Promise.all(
      Array.from({ length: 6 }, async (_, i) => {
        const monthDate = subMonths(referenceDate, 5 - i)
        const monthStart = startOfMonth(monthDate)
        const monthEnd = endOfMonth(monthDate)
        
        const transactions = await fetchTransactionsWithAccounts(userId, monthStart, monthEnd)
        
        return { monthDate, transactions }
      })
    )

    // Calculate spending trends (daily breakdown)
    const spendingTrends = calculateDailySpending(
      thisMonthTransactions,
      thisMonthStart,
      baseCurrency,
      rateMap
    )

    // Calculate category breakdown
    const categoryBreakdown = calculateCategoryBreakdown(
      thisMonthTransactions,
      baseCurrency,
      rateMap
    )

    // Calculate month comparison (6 months)
    const monthComparison = calculateMonthComparison(
      thisMonthTransactions,
      lastMonthTransactions,
      monthlyData,
      baseCurrency,
      rateMap
    )

    // Calculate savings rate
    const savingsRate =
      monthComparison.thisMonth.income > 0
        ? (monthComparison.thisMonth.savings / monthComparison.thisMonth.income) * 100
        : 0

    return SuccessResponse({
      spendingTrends,
      categoryBreakdown,
      monthComparison,
      savingsRate,
    })
  } catch (error) {
    console.error('Error fetching dashboard analytics:', error)
    return InternalServerErrorResponse<DashboardAnalytics>('Failed to fetch dashboard analytics')
  }
}

/**
 * Fetch transactions with account information
 */
async function fetchTransactionsWithAccounts(userId: string, start: Date, end: Date) {
  return prisma.transaction.findMany({
    where: {
      userId,
      deletedAt: null,
      date: {
        gte: start,
        lte: end,
      },
    },
    include: {
      fromAccount: {
        select: { type: true, name: true },
      },
      toAccount: {
        select: { type: true, name: true },
      },
    },
    orderBy: { date: 'asc' },
  })
}

/**
 * Calculate daily spending for the month
 */
function calculateDailySpending(
  transactions: any[],
  monthStart: Date,
  baseCurrency: Currency,
  rateMap: ExchangeRateMap
): DailySpending[] {
  const daysInMonth = getDaysInMonth(monthStart)
  const dailyData: Record<string, { income: number; expenses: number }> = {}

  // Initialize all days with zero
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(monthStart)
    date.setDate(day)
    const dateStr = date.toISOString().split('T')[0]!
    dailyData[dateStr] = { income: 0, expenses: 0 }
  }

  // Aggregate transactions by day
  for (const tx of transactions) {
    const dateStr = new Date(tx.date).toISOString().split('T')[0]!
    if (!dailyData[dateStr]) continue

    try {
      const amount = Number(convertAmount(tx.amount, tx.currency, baseCurrency, rateMap))

      // Income: FROM income account TO asset account
      if (tx.fromAccount.type === 'income' && tx.toAccount.type === 'asset') {
        dailyData[dateStr].income += amount
      }
      // Expense: FROM asset account TO expense account
      else if (tx.fromAccount.type === 'asset' && tx.toAccount.type === 'expense') {
        dailyData[dateStr].expenses += amount
      }
    } catch (error) {
      console.warn('Failed to convert transaction amount:', error)
    }
  }

  // Convert to array and sort by date
  return Object.entries(dailyData)
    .map(([date, data]) => ({
      date,
      income: data.income,
      expenses: data.expenses,
    }))
    .sort((a, b) => a.date.localeCompare(b.date))
}

/**
 * Calculate category breakdown (top 5 expense categories)
 */
function calculateCategoryBreakdown(
  transactions: any[],
  baseCurrency: Currency,
  rateMap: ExchangeRateMap
): CategoryBreakdown[] {
  const categories: Record<string, { amount: number; count: number }> = {}
  let totalExpenses = 0

  for (const tx of transactions) {
    // Only process expense transactions
    if (tx.fromAccount.type === 'asset' && tx.toAccount.type === 'expense') {
      const category = tx.toAccount.name

      try {
        const amount = Number(convertAmount(tx.amount, tx.currency, baseCurrency, rateMap))

        if (!categories[category]) {
          categories[category] = { amount: 0, count: 0 }
        }

        categories[category].amount += amount
        categories[category].count += 1
        totalExpenses += amount
      } catch (error) {
        console.warn('Failed to convert transaction amount:', error)
      }
    }
  }

  // Convert to array, calculate percentages, sort by amount, take top 5
  return Object.entries(categories)
    .map(([category, data]) => ({
      category,
      amount: data.amount,
      percentage: totalExpenses > 0 ? (data.amount / totalExpenses) * 100 : 0,
      count: data.count,
    }))
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 5)
}

/**
 * Calculate month-over-month comparison (6 months)
 */
function calculateMonthComparison(
  thisMonthTransactions: any[],
  lastMonthTransactions: any[],
  monthlyData: { monthDate: Date; transactions: any[] }[],
  baseCurrency: Currency,
  rateMap: ExchangeRateMap
): MonthComparison {
  const thisMonth = calculateMonthTotals(thisMonthTransactions, baseCurrency, rateMap)
  const lastMonth = calculateMonthTotals(lastMonthTransactions, baseCurrency, rateMap)

  const change = {
    income: lastMonth.income > 0 ? ((thisMonth.income - lastMonth.income) / lastMonth.income) * 100 : 0,
    expenses:
      lastMonth.expenses > 0 ? ((thisMonth.expenses - lastMonth.expenses) / lastMonth.expenses) * 100 : 0,
    savings: lastMonth.savings > 0 ? ((thisMonth.savings - lastMonth.savings) / lastMonth.savings) * 100 : 0,
  }

  // Calculate data for last 6 months using pre-fetched data
  const monthNames: string[] = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  
  const months: MonthData[] = monthlyData.map(({ monthDate, transactions }) => {
    const totals = calculateMonthTotals(transactions, baseCurrency, rateMap)
    const monthName = monthNames[monthDate.getMonth()]!
    
    return {
      month: monthName, // Just the month abbreviation (e.g., "Jan", "Feb")
      income: totals.income,
      expenses: totals.expenses,
      savings: totals.savings,
    }
  })

  return {
    months,
    thisMonth,
    lastMonth,
    change,
  }
}

/**
 * Calculate totals for a month
 */
function calculateMonthTotals(
  transactions: any[],
  baseCurrency: Currency,
  rateMap: ExchangeRateMap
): {
  income: number
  expenses: number
  savings: number
} {
  let income = 0
  let expenses = 0

  for (const tx of transactions) {
    try {
      const amount = Number(convertAmount(tx.amount, tx.currency, baseCurrency, rateMap))

      // Income: FROM income account TO asset account
      if (tx.fromAccount.type === 'income' && tx.toAccount.type === 'asset') {
        income += amount
      }
      // Expense: FROM asset account TO expense account
      else if (tx.fromAccount.type === 'asset' && tx.toAccount.type === 'expense') {
        expenses += amount
      }
    } catch (error) {
      console.warn('Failed to convert transaction amount:', error)
    }
  }

  return {
    income,
    expenses,
    savings: income - expenses,
  }
}

