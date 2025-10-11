import { NextRequest, NextResponse } from 'next/server'
import { withAuth, errorResponse } from '@repo/auth/api-middleware'
import { prisma } from '@repo/db'

/**
 * GET /api/settings
 * Get user settings (base currency, etc.)
 */
export const GET = withAuth(async (_request: NextRequest, userId: string) => {
  try {
    // Get or create user settings
    let settings = await prisma.userSettings.findUnique({
      where: { userId },
    })

    if (!settings) {
      settings = await prisma.userSettings.create({
        data: {
          userId,
          baseCurrency: 'EGP', // Default
        },
      })
    }

    return NextResponse.json({
      baseCurrency: settings.baseCurrency,
    })
  } catch (error) {
    console.error('Error fetching user settings:', error)
    return errorResponse('Failed to fetch settings', 500)
  }
})

