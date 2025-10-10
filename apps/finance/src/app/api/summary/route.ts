/**
 * Summary API Route
 * Thin wrapper around feature handler
 */
import { NextRequest, NextResponse } from 'next/server'
import { withAuth, errorResponse } from '@repo/auth/api-middleware'
import { getSummary } from '@/features/dashboard/api/get-summary'

/**
 * GET /api/summary
 * Get financial summary for a date range
 * Query params: dateFrom, dateTo (optional, defaults to current month)
 */
export const GET = withAuth(async (request: NextRequest, userId: string) => {
  try {
    // Parse date range parameters
    const searchParams = request.nextUrl.searchParams
    const options = {
      dateFrom: searchParams.get('dateFrom') ? new Date(searchParams.get('dateFrom')!) : undefined,
      dateTo: searchParams.get('dateTo') ? new Date(searchParams.get('dateTo')!) : undefined,
    }

    // Call feature handler
    const result = await getSummary(userId, options)

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error in GET /api/summary:', error)
    return errorResponse('Failed to fetch summary', 500, error)
  }
})
