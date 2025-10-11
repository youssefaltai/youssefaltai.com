/**
 * Budget Detail API Routes
 */
import { NextRequest, NextResponse } from 'next/server'
import { withAuth, errorResponse, validationError } from '@repo/auth/api-middleware'
import { updateBudget } from '@/features/budgets/api/update-budget'
import { deleteBudget } from '@/features/budgets/api/delete-budget'

/**
 * PATCH /api/budgets/[id]
 * Update an existing budget
 */
export const PATCH = withAuth(async (
  request: NextRequest,
  userId: string,
  context?: { params: Promise<{ id: string }> }
) => {
  try {
    const { id } = await context!.params
    const body = await request.json()

    // Call feature handler
    const budget = await updateBudget(userId, id, body)

    return NextResponse.json(budget)
  } catch (error) {
    console.error('Error updating budget:', error)
    
    if (error instanceof Error && error.message.includes('not found')) {
      return errorResponse(error.message, 404)
    }
    
    if (error instanceof Error && error.message.includes('validation')) {
      return validationError(error.message)
    }
    
    return errorResponse(
      error instanceof Error ? error.message : 'Failed to update budget',
      500
    )
  }
})

/**
 * DELETE /api/budgets/[id]
 * Delete a budget
 */
export const DELETE = withAuth(async (
  _request: NextRequest,
  userId: string,
  context?: { params: Promise<{ id: string }> }
) => {
  try {
    const { id } = await context!.params

    // Call feature handler
    await deleteBudget(userId, id)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting budget:', error)
    
    if (error instanceof Error && error.message.includes('not found')) {
      return errorResponse(error.message, 404)
    }
    
    return errorResponse(
      error instanceof Error ? error.message : 'Failed to delete budget',
      500
    )
  }
})

