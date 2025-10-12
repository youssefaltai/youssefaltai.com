import { NextRequest, NextResponse } from "next/server"
import { verifyAuth } from "@repo/auth/verify-auth"
import { ApiResponse } from "@repo/types"
import { UnauthorizedResponse, SuccessResponse, InternalServerErrorResponse } from "@/shared/utils/api"
import { prisma } from "@repo/db"
import { startOfMonth, endOfMonth } from "@repo/utils"
import { convertAmount, ExchangeRateMap } from "@/shared/finance-utils"
import getTransactionsSummary from "@/features/transactions/api/get-transactions-summary"

interface DashboardSummary {
  totalBalance: number
  netWorth: number
  thisMonthIncome: number
  thisMonthExpenses: number
}

/**
 * GET /api/dashboard/summary
 * Returns dashboard summary with all calculations done server-side
 * - Total balance (assets only, converted to base currency)
 * - Net worth (assets - liabilities, converted to base currency)
 * - This month's income and expenses (converted to base currency)
 */
export async function GET(request: NextRequest): Promise<NextResponse<ApiResponse<DashboardSummary>>> {
  const { authenticated, userId } = await verifyAuth(request)
  if (!authenticated) return UnauthorizedResponse(userId)

  try {
    // Fetch user profile for base currency
    const profile = await prisma.user.findUnique({
      where: { id: userId },
      select: { baseCurrency: true },
    })

    if (!profile) {
      return InternalServerErrorResponse<DashboardSummary>('User profile not found')
    }

    const baseCurrency = profile.baseCurrency

    // Fetch all accounts and exchange rates in parallel
    const [accounts, rates] = await Promise.all([
      prisma.account.findMany({
        where: { userId, deletedAt: null },
        select: {
          type: true,
          balance: true,
          currency: true,
        },
      }),
      prisma.exchangeRate.findMany({
        where: { userId, deletedAt: null },
        select: {
          fromCurrency: true,
          toCurrency: true,
          rate: true,
        },
      }),
    ])

    // Build exchange rate map
    const rateMap: ExchangeRateMap = new Map()
    for (const rate of rates) {
      const key = `${rate.fromCurrency}_TO_${rate.toCurrency}`
      rateMap.set(key, rate.rate)
    }

    // Calculate total balance (assets only)
    const totalBalance = accounts
      .filter((acc) => acc.type === 'asset')
      .reduce((sum: number, acc) => {
        try {
          const converted = convertAmount(acc.balance, acc.currency, baseCurrency, rateMap)
          return sum + Number(converted)
        } catch {
          return sum
        }
      }, 0)

    // Calculate net worth (assets - liabilities)
    const assets = accounts
      .filter((acc) => acc.type === 'asset')
      .reduce((sum: number, acc) => {
        try {
          const converted = convertAmount(acc.balance, acc.currency, baseCurrency, rateMap)
          return sum + Number(converted)
        } catch {
          return sum
        }
      }, 0)

    const liabilities = accounts
      .filter((acc) => acc.type === 'liability')
      .reduce((sum: number, acc) => {
        try {
          const converted = convertAmount(acc.balance, acc.currency, baseCurrency, rateMap)
          return sum + Number(converted)
        } catch {
          return sum
        }
      }, 0)

    const netWorth = assets - liabilities

    // Get this month's transaction summary
    const now = new Date()
    const summary = await getTransactionsSummary(userId, {
      dateFrom: startOfMonth(now).toISOString(),
      dateTo: endOfMonth(now).toISOString(),
    })

    return SuccessResponse({
      totalBalance,
      netWorth,
      thisMonthIncome: summary.totalIncome,
      thisMonthExpenses: summary.totalExpenses,
    })
  } catch (error) {
    console.error('Error fetching dashboard summary:', error)
    return InternalServerErrorResponse<DashboardSummary>('Failed to fetch dashboard summary')
  }
}
