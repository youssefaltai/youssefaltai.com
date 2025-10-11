/**
 * Budget API Routes
 * Thin wrapper around feature handlers
 */
import { NextRequest, NextResponse } from 'next/server'
import { withAuth, errorResponse, validationError } from '@repo/auth/api-middleware'
import { getBudgets } from '@/features/budgets/api/get-budgets'
import { createBudget } from '@/features/budgets/api/create-budget'

/**
 * GET /api/budgets
 * List budgets with optional filters
 */
export const GET = withAuth(async (request: NextRequest, userId: string) => {
  try {
    // Parse query parameters
    const searchParams = request.nextUrl.searchParams
    const categoriesParam = searchParams.get('categories')
    
    const filters = {
      categories: categoriesParam ? categoriesParam.split(',') : undefined,
      dateFrom: searchParams.get('dateFrom') || undefined,
      dateTo: searchParams.get('dateTo') || undefined,
    }

    // Call feature handler
    const budgets = await getBudgets(userId, filters)

    return NextResponse.json(budgets)
  } catch (error) {
    console.error('Error fetching budgets:', error)
    return errorResponse('Failed to fetch budgets', 500)
  }
})

/**
 * POST /api/budgets
 * Create a new budget
 */
export const POST = withAuth(async (request: NextRequest, userId: string) => {
  try {
    const body = await request.json()

    // Call feature handler
    const budget = await createBudget(userId, body)

    return NextResponse.json(budget, { status: 201 })
  } catch (error) {
    console.error('Error creating budget:', error)
    
    if (error instanceof Error && error.message.includes('validation')) {
      return validationError(error.message)
    }
    
    return errorResponse(
      error instanceof Error ? error.message : 'Failed to create budget',
      500
    )
  }
})

