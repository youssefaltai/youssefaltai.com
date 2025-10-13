import { NextRequest, NextResponse } from "next/server"
import { verifyAuth } from "@repo/auth/verify-auth"
import { ApiResponse } from "@repo/types"
import { UnauthorizedResponse, SuccessResponse, InternalServerErrorResponse, BadRequestResponse } from "@/shared/utils/api"
import { prisma } from "@repo/db"
import { z } from "zod"

export interface WidgetPreference {
  id: string
  widgetId: string
  visible: boolean
  order: number
}

const UpdateWidgetPreferencesSchema = z.array(
  z.object({
    widgetId: z.string(),
    visible: z.boolean(),
    order: z.number().int().min(0),
  })
)

/**
 * GET /api/user/widget-preferences
 * Fetch user's widget visibility and order preferences
 * Returns default preferences if none exist
 */
export async function GET(): Promise<NextResponse<ApiResponse<WidgetPreference[]>>> {
  const { authenticated, userId } = await verifyAuth()
  if (!authenticated) return UnauthorizedResponse(userId)

  try {
    const preferences = await prisma.widgetPreference.findMany({
      where: { userId, deletedAt: null },
      select: {
        id: true,
        widgetId: true,
        visible: true,
        order: true,
      },
      orderBy: { order: 'asc' },
    })

    // If no preferences exist, return default configuration
    if (preferences.length === 0) {
      const defaultPreferences = getDefaultWidgetPreferences()
      return SuccessResponse(defaultPreferences.map((pref, index) => ({
        id: '',
        widgetId: pref.widgetId,
        visible: pref.visible,
        order: index,
      })))
    }

    return SuccessResponse(preferences)
  } catch (error) {
    console.error('Error fetching widget preferences:', error)
    return InternalServerErrorResponse<WidgetPreference[]>('Failed to fetch widget preferences')
  }
}

/**
 * PUT /api/user/widget-preferences
 * Update user's widget preferences
 * Creates or updates preferences for all provided widgets
 */
export async function PUT(request: NextRequest): Promise<NextResponse<ApiResponse<WidgetPreference[]>>> {
  const { authenticated, userId } = await verifyAuth()
  if (!authenticated) return UnauthorizedResponse(userId)

  try {
    const body = await request.json()
    const preferences = UpdateWidgetPreferencesSchema.parse(body)

    // Upsert all preferences in a transaction
    const updated = await prisma.$transaction(
      preferences.map((pref) =>
        prisma.widgetPreference.upsert({
          where: {
            userId_widgetId: {
              userId,
              widgetId: pref.widgetId,
            },
          },
          create: {
            userId,
            widgetId: pref.widgetId,
            visible: pref.visible,
            order: pref.order,
          },
          update: {
            visible: pref.visible,
            order: pref.order,
          },
          select: {
            id: true,
            widgetId: true,
            visible: true,
            order: true,
          },
        })
      )
    )

    return SuccessResponse(updated)
  } catch (error) {
    console.error('Error updating widget preferences:', error)
    if (error instanceof z.ZodError) {
      return BadRequestResponse<WidgetPreference[]>('Invalid widget preferences format')
    }
    return InternalServerErrorResponse<WidgetPreference[]>('Failed to update widget preferences')
  }
}

/**
 * Default widget configuration
 * Used when user has no saved preferences
 */
function getDefaultWidgetPreferences() {
  return [
    { widgetId: 'net-worth', visible: true },
    { widgetId: 'alerts', visible: true },
    { widgetId: 'financial-health', visible: true },
    { widgetId: 'spending-trends', visible: true },
    { widgetId: 'category-breakdown', visible: true },
    { widgetId: 'month-comparison', visible: true },
    { widgetId: 'quick-stats', visible: true },
    { widgetId: 'goals', visible: true },
    { widgetId: 'account-balances', visible: true },
    { widgetId: 'insights', visible: true },
    { widgetId: 'recent-transactions', visible: true },
  ]
}

