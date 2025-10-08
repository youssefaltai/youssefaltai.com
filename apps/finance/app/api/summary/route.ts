/**
 * Summary API Route
 * Provides financial overview and statistics
 */
import { NextRequest, NextResponse } from 'next/server'
import { prisma, Prisma } from '@repo/db'
import { verifyToken } from '@repo/auth'
import { currentMonthRange } from '@repo/utils'

/**
 * GET /api/summary
 * Get financial summary for a date range
 * Query params: dateFrom, dateTo (optional, defaults to current month)
 */
export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const token = request.cookies.get('auth_token')?.value
    if (!token) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const payload = await verifyToken(token)
    if (!payload?.id) {
      return NextResponse.json({ message: 'Invalid token' }, { status: 401 })
    }
    
    const userId = payload.id

    // Parse date range (default to current month)
    const searchParams = request.nextUrl.searchParams
    const monthRange = currentMonthRange()
    
    const dateFrom = searchParams.get('dateFrom')
      ? new Date(searchParams.get('dateFrom')!)
      : monthRange.start

    const dateTo = searchParams.get('dateTo')
      ? new Date(searchParams.get('dateTo')!)
      : monthRange.end

    // Build query condition
    const where: Prisma.TransactionWhereInput = {
      userId: userId,
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
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + Number(t.baseAmount), 0)

    const expenses = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + Number(t.baseAmount), 0)

    const balance = income - expenses

    // Get category breakdown
    const categoryMap = new Map<string, { name: string; amount: number; type: string }>()
    
    transactions.forEach(t => {
      const existing = categoryMap.get(t.category) || { name: t.category, amount: 0, type: t.type }
      existing.amount += Number(t.baseAmount)
      categoryMap.set(t.category, existing)
    })

    const categoryBreakdown = Array.from(categoryMap.values())
      .sort((a, b) => b.amount - a.amount)

    // Get currency breakdown (what currencies were used)
    const currencyMap = new Map<string, { currency: string; count: number; totalOriginal: number }>()
    
    transactions.forEach(t => {
      const existing = currencyMap.get(t.currency) || { currency: t.currency, count: 0, totalOriginal: 0 }
      existing.count += 1
      existing.totalOriginal += Number(t.amount)
      currencyMap.set(t.currency, existing)
    })

    const currencyBreakdown = Array.from(currencyMap.values())
      .sort((a, b) => b.count - a.count)

    // Get base currency from user settings
    const userSettings = await prisma.userSettings.findUnique({
      where: { userId: userId },
    })

    return NextResponse.json({
      summary: {
        dateFrom,
        dateTo,
        baseCurrency: userSettings?.baseCurrency || 'EUR',
        income,
        expenses,
        balance,
        transactionCount: transactions.length,
      },
      categoryBreakdown,
      currencyBreakdown,
      recentTransactions: transactions.slice(0, 5), // Last 5 transactions
    })
  } catch (error) {
    console.error('Error fetching summary:', error)
    return NextResponse.json(
      { message: 'Failed to fetch summary', error: String(error) },
      { status: 500 }
    )
  }
}
