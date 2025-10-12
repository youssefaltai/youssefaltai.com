import { NextRequest, NextResponse } from "next/server"
import { verifyAuth } from "@repo/auth/verify-auth"
import { ApiResponse } from "@repo/types"
import { UnauthorizedResponse, SuccessResponse, InternalServerErrorResponse } from "@/shared/utils/api"
import { prisma } from "@repo/db"
import { calculateCreditUtilization, calculateDaysUntilDue } from "@/utils/calculations"

export type AlertSeverity = 'high' | 'medium' | 'low'
export type AlertType = 'credit-utilization' | 'due-date' | 'overdue' | 'goal-deadline'

export interface Alert {
  id: string
  type: AlertType
  severity: AlertSeverity
  title: string
  message: string
  accountId: string
  accountName: string
  actionUrl?: string
}

/**
 * GET /api/dashboard/alerts
 * Returns active alerts for the user
 * - High credit card utilization (>70%)
 * - Upcoming due dates (within 7-30 days)
 * - Overdue payments
 * - Goals approaching deadline
 */
export async function GET(request: NextRequest): Promise<NextResponse<ApiResponse<Alert[]>>> {
  const { authenticated, userId } = await verifyAuth(request)
  if (!authenticated) return UnauthorizedResponse(userId)

  try {
    const alerts: Alert[] = []

    // Fetch credit cards (liabilities with target = credit limit)
    const creditCards = await prisma.account.findMany({
      where: {
        userId,
        deletedAt: null,
        type: 'liability',
        target: { not: null }, // Credit cards have credit limit as target
      },
      select: {
        id: true,
        name: true,
        balance: true,
        target: true,
      },
    })

    // Check credit card utilization
    for (const card of creditCards) {
      if (!card.target) continue

      const utilization = calculateCreditUtilization(Number(card.balance), Number(card.target))

      if (utilization > 70) {
        alerts.push({
          id: `credit-${card.id}`,
          type: 'credit-utilization',
          severity: utilization > 90 ? 'high' : 'medium',
          title: 'High Credit Utilization',
          message: `${card.name} is ${Math.round(utilization)}% utilized`,
          accountId: card.id,
          accountName: card.name,
          actionUrl: '/more', // Link to credit cards page
        })
      }
    }

    // Fetch loans and goals with due dates
    const accountsWithDueDates = await prisma.account.findMany({
      where: {
        userId,
        deletedAt: null,
        dueDate: { not: null },
        OR: [
          { type: 'liability' }, // Loans
          { type: 'asset', target: { not: null } }, // Goals with targets
        ],
      },
      select: {
        id: true,
        name: true,
        type: true,
        dueDate: true,
        balance: true,
        target: true,
      },
    })

    // Check due dates
    for (const account of accountsWithDueDates) {
      if (!account.dueDate) continue

      const daysUntil = calculateDaysUntilDue(account.dueDate)

      // Overdue
      if (daysUntil < 0) {
        alerts.push({
          id: `overdue-${account.id}`,
          type: 'overdue',
          severity: 'high',
          title: account.type === 'liability' ? 'Payment Overdue' : 'Goal Overdue',
          message: `${account.name} was due ${Math.abs(daysUntil)} days ago`,
          accountId: account.id,
          accountName: account.name,
          actionUrl: account.type === 'liability' ? '/more' : '/goals',
        })
      }
      // Due within 7 days
      else if (daysUntil <= 7) {
        alerts.push({
          id: `due-soon-${account.id}`,
          type: 'due-date',
          severity: 'high',
          title: account.type === 'liability' ? 'Payment Due Soon' : 'Goal Deadline Approaching',
          message: `${account.name} is due in ${daysUntil} ${daysUntil === 1 ? 'day' : 'days'}`,
          accountId: account.id,
          accountName: account.name,
          actionUrl: account.type === 'liability' ? '/more' : '/goals',
        })
      }
      // Due within 30 days
      else if (daysUntil <= 30) {
        alerts.push({
          id: `due-${account.id}`,
          type: 'due-date',
          severity: 'medium',
          title: account.type === 'liability' ? 'Upcoming Payment' : 'Goal Deadline',
          message: `${account.name} is due in ${daysUntil} days`,
          accountId: account.id,
          accountName: account.name,
          actionUrl: account.type === 'liability' ? '/more' : '/goals',
        })
      }

      // For goals, check if on track to meet deadline
      if (account.type === 'asset' && account.target && account.dueDate && daysUntil > 0) {
        const progress = (Number(account.balance) / Number(account.target)) * 100
        
        // Simple check: if less than 50% complete and deadline is within 30 days
        if (progress < 50 && daysUntil <= 30) {
          alerts.push({
            id: `goal-behind-${account.id}`,
            type: 'goal-deadline',
            severity: 'low',
            title: 'Goal May Miss Deadline',
            message: `${account.name} is ${Math.round(progress)}% complete with ${daysUntil} days remaining`,
            accountId: account.id,
            accountName: account.name,
            actionUrl: '/goals',
          })
        }
      }
    }

    // Sort alerts by severity (high → medium → low)
    const severityOrder = { high: 0, medium: 1, low: 2 }
    alerts.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity])

    return SuccessResponse(alerts)
  } catch (error) {
    console.error('Error fetching dashboard alerts:', error)
    return InternalServerErrorResponse<Alert[]>('Failed to fetch dashboard alerts')
  }
}

