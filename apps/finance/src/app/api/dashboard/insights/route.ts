import { NextResponse } from "next/server"
import { verifyAuth } from "@repo/auth/verify-auth"
import { ApiResponse } from "@repo/types"
import { UnauthorizedResponse, SuccessResponse, InternalServerErrorResponse } from "@/shared/utils/api"
import { prisma, Prisma } from "@repo/db"
import { startOfMonth, endOfMonth, getDaysInMonth, getDate, subMonths } from "@repo/utils"
import { convertAmount, ExchangeRateMap } from "@/shared/finance-utils"
import {
  calculateSpendingVelocity,
  calculateFinancialHealthScore,
  forecastGoalCompletion,
  calculateCreditUtilization,
} from "@/utils/calculations"

export interface Insight {
  id: string
  type: 'info' | 'positive' | 'warning'
  icon: string // Icon name from lucide-react
  message: string
}

export interface HealthScoreMetadata {
  score: number
  label: string
  color: string // Tailwind color class (e.g., 'text-ios-green')
  tips: string[]
}

export interface DashboardInsights {
  insights: Insight[]
  healthScore: number
  healthScoreMetadata: HealthScoreMetadata
  largestExpense?: {
    amount: number
    category: string
    currency: string
  }
  largestIncome?: {
    amount: number
    source: string
    currency: string
  }
}

/**
 * Generate health score metadata based on score
 * Centralizes color, label, and tips logic in the backend
 */
function generateHealthScoreMetadata(score: number): HealthScoreMetadata {
  if (score >= 80) {
    return {
      score,
      label: 'Excellent',
      color: 'text-ios-green stroke-ios-green',
      tips: [
        'Keep up the great work!',
        'Continue your savings habits',
        'Consider investing for growth',
      ],
    }
  }
  
  if (score >= 60) {
    return {
      score,
      label: 'Good',
      color: 'text-ios-blue stroke-ios-blue',
      tips: [
        'Try to save at least 20% of income',
        'Keep credit utilization below 30%',
        'Stay on top of due dates',
      ],
    }
  }
  
  if (score >= 40) {
    return {
      score,
      label: 'Fair',
      color: 'text-ios-orange stroke-ios-orange',
      tips: [
        'Focus on increasing your savings rate',
        'Pay down high-interest debt first',
        'Build an emergency fund',
      ],
    }
  }
  
  return {
    score,
    label: 'Needs Work',
    color: 'text-ios-red stroke-ios-red',
    tips: [
      'Start by tracking all expenses',
      'Create a realistic budget',
      'Focus on reducing debt',
    ],
  }
}

/**
 * GET /api/dashboard/insights
 * Returns calculated insights for the dashboard
 * - Largest transactions this month
 * - Spending velocity
 * - Goal completion forecasts
 * - Financial health score
 */
export async function GET(): Promise<NextResponse<ApiResponse<DashboardInsights>>> {
  const { authenticated, userId } = await verifyAuth()
  if (!authenticated) return UnauthorizedResponse(userId)

  try {
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
      return InternalServerErrorResponse<DashboardInsights>('User not found')
    }

    const baseCurrency = user.baseCurrency

    // Build exchange rate map
    const rateMap: ExchangeRateMap = new Map()
    for (const rate of exchangeRates) {
      const key = `${rate.fromCurrency}_TO_${rate.toCurrency}`
      rateMap.set(key, rate.rate)
    }

    const now = new Date()
    const monthStart = startOfMonth(now)
    const monthEnd = endOfMonth(now)

    // Fetch this month's transactions
    const transactions = await prisma.transaction.findMany({
      where: {
        userId,
        deletedAt: null,
        date: {
          gte: monthStart,
          lte: monthEnd,
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
      orderBy: { date: 'desc' },
    })

    const insights: Insight[] = []

    // Calculate totals
    let totalIncome = 0
    let totalExpenses = 0
    let largestExpense: { amount: number; category: string; currency: string } | undefined = undefined
    let largestIncome: { amount: number; source: string; currency: string } | undefined = undefined

    for (const tx of transactions) {
      try {
        const amount = Number(convertAmount(tx.amount, tx.currency, baseCurrency, rateMap))

        // Income
        if (tx.fromAccount.type === 'income' && tx.toAccount.type === 'asset') {
          totalIncome += amount
          if (largestIncome === undefined || amount > largestIncome.amount) {
            largestIncome = {
              amount,
              source: tx.fromAccount.name,
              currency: baseCurrency,
            }
          }
        }
        // Expense
        else if (tx.fromAccount.type === 'asset' && tx.toAccount.type === 'expense') {
          totalExpenses += amount
          if (largestExpense === undefined || amount > largestExpense.amount) {
            largestExpense = {
              amount,
              category: tx.toAccount.name,
              currency: baseCurrency,
            }
          }
        }
      } catch (error) {
        console.warn('Failed to convert transaction amount:', error)
      }
    }

    // Spending velocity insight
    const daysInMonth = getDaysInMonth(now)
    const currentDay = getDate(now)
    const daysRemaining = daysInMonth - currentDay

    if (totalExpenses > 0 && daysRemaining > 0) {
      const velocity = calculateSpendingVelocity(totalExpenses, currentDay, daysRemaining)

      if (velocity.projectedTotal > totalIncome * 0.9) {
        insights.push({
          id: 'spending-velocity-high',
          type: 'warning',
          icon: 'TrendingUp',
          message: `At your current pace, you'll spend ${velocity.projectedTotal.toFixed(0)} ${baseCurrency} this month`,
        })
      } else if (velocity.projectedTotal < totalIncome * 0.7) {
        insights.push({
          id: 'spending-velocity-good',
          type: 'positive',
          icon: 'TrendingDown',
          message: `You're on track to save ${(totalIncome - velocity.projectedTotal).toFixed(0)} ${baseCurrency} this month`,
        })
      } else {
        insights.push({
          id: 'spending-velocity',
          type: 'info',
          icon: 'Activity',
          message: `You're spending an average of ${velocity.dailyAverage.toFixed(0)} ${baseCurrency} per day`,
        })
      }
    }

    // Savings insight
    const savings = totalIncome - totalExpenses
    const savingsRate = totalIncome > 0 ? (savings / totalIncome) * 100 : 0

    if (savingsRate > 20) {
      insights.push({
        id: 'savings-rate-excellent',
        type: 'positive',
        icon: 'PiggyBank',
        message: `Great job! You're saving ${savingsRate.toFixed(0)}% of your income this month`,
      })
    } else if (savingsRate < 0) {
      insights.push({
        id: 'savings-rate-negative',
        type: 'warning',
        icon: 'AlertTriangle',
        message: `You're spending more than you earn this month`,
      })
    } else if (savingsRate < 10) {
      insights.push({
        id: 'savings-rate-low',
        type: 'info',
        icon: 'Target',
        message: `Try to save at least 10% of your income for financial stability`,
      })
    }

    // Fetch accounts for health score calculation
    const accounts = await prisma.account.findMany({
      where: { userId, deletedAt: null },
      select: {
        id: true,
        type: true,
        balance: true,
        target: true,
        dueDate: true,
        currency: true,
      },
    })

    // Calculate net worth
    const assets = accounts
      .filter((acc) => acc.type === 'asset')
      .reduce((sum, acc) => {
        try {
          return sum + Number(convertAmount(acc.balance, acc.currency, baseCurrency, rateMap))
        } catch {
          return sum
        }
      }, 0)

    const liabilities = accounts
      .filter((acc) => acc.type === 'liability')
      .reduce((sum, acc) => {
        try {
          return sum + Number(convertAmount(acc.balance, acc.currency, baseCurrency, rateMap))
        } catch {
          return sum
        }
      }, 0)

    const netWorth = assets - liabilities

    // Calculate average credit utilization
    const creditCards = accounts.filter((acc) => acc.type === 'liability' && acc.target)
    let totalUtilization = 0
    let creditCardCount = 0

    for (const card of creditCards) {
      if (card.target) {
        totalUtilization += calculateCreditUtilization(Number(card.balance), Number(card.target))
        creditCardCount++
      }
    }

    const avgCreditUtilization = creditCardCount > 0 ? totalUtilization / creditCardCount : 0

    // Check for overdue payments
    const hasOverduePayments = accounts.some(
      (acc) => acc.dueDate && new Date(acc.dueDate) < now && acc.type === 'liability'
    )

    // Calculate financial health score
    const healthScore = calculateFinancialHealthScore({
      netWorth,
      savingsRate,
      creditUtilization: avgCreditUtilization,
      hasOverduePayments,
    })

    // Health score insight
    if (healthScore >= 80) {
      insights.push({
        id: 'health-score-excellent',
        type: 'positive',
        icon: 'Heart',
        message: `Your financial health score is ${healthScore}/100 - Excellent!`,
      })
    } else if (healthScore >= 60) {
      insights.push({
        id: 'health-score-good',
        type: 'info',
        icon: 'Heart',
        message: `Your financial health score is ${healthScore}/100 - Good progress!`,
      })
    } else if (healthScore < 40) {
      insights.push({
        id: 'health-score-needs-work',
        type: 'warning',
        icon: 'Heart',
        message: `Your financial health score is ${healthScore}/100 - Let's work on improving it`,
      })
    }

    // Goal forecast insights
    const goals = accounts.filter((acc) => acc.type === 'asset' && acc.target && acc.dueDate)
    const sixMonthsAgo = subMonths(now, 6)
    
    for (const goal of goals.slice(0, 2)) {
      // Top 2 goals
      if (!goal.target || !goal.dueDate) continue

      // Calculate actual contributions from transaction history
      const contributions = await prisma.transaction.findMany({
        where: {
          toAccountId: goal.id,
          date: { gte: sixMonthsAgo },
          deletedAt: null,
        },
        select: { amount: true, currency: true },
      })

      let totalContributed = new Prisma.Decimal(0)
      for (const contrib of contributions) {
        try {
          const converted = convertAmount(contrib.amount, contrib.currency, baseCurrency, rateMap)
          totalContributed = totalContributed.add(converted)
        } catch (error) {
          console.warn('Failed to convert contribution:', error)
        }
      }

      const monthlyContribution = contributions.length > 0 
        ? Number(totalContributed) / 6 
        : 0

      const forecast = forecastGoalCompletion(
        Number(goal.balance),
        Number(goal.target),
        monthlyContribution,
        goal.dueDate
      )

      if (!forecast.onTrack && forecast.monthsRemaining < Infinity) {
        insights.push({
          id: `goal-forecast-${goal.id}`,
          type: 'warning',
          icon: 'Target',
          message: `You may not reach your goal on time. Consider increasing contributions`,
        })
      } else if (forecast.onTrack && forecast.monthsRemaining > 0) {
        insights.push({
          id: `goal-forecast-${goal.id}`,
          type: 'positive',
          icon: 'Target',
          message: `You're on track to reach your goal in ${forecast.monthsRemaining} months`,
        })
      }
    }

    // Transaction count insight
    if (transactions.length === 0) {
      insights.push({
        id: 'no-transactions',
        type: 'info',
        icon: 'Receipt',
        message: 'No transactions yet this month. Start tracking your finances!',
      })
    }

    // Limit to 5 most important insights
    const prioritizedInsights = insights.slice(0, 5)

    // Generate health score metadata
    const healthScoreMetadata = generateHealthScoreMetadata(healthScore)

    return SuccessResponse({
      insights: prioritizedInsights,
      healthScore,
      healthScoreMetadata,
      largestExpense,
      largestIncome,
    })
  } catch (error) {
    console.error('Error fetching dashboard insights:', error)
    return InternalServerErrorResponse<DashboardInsights>('Failed to fetch dashboard insights')
  }
}

