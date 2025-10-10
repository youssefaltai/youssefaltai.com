/**
 * Transaction [id] API Routes
 * Thin wrapper around feature handlers
 */
import { NextRequest, NextResponse } from 'next/server'
import { withAuth, errorResponse, validationError } from '@repo/auth/api-middleware'
import { updateTransaction } from '@/features/transactions/api/update-transaction'
import { deleteTransaction } from '@/features/transactions/api/delete-transaction'

/**
 * PATCH /api/transactions/[id]
 * Update an existing transaction
 */
export const PATCH = withAuth(
  async (request: NextRequest, userId: string, context?: { params: Promise<{ id: string }> }) => {
    try {
      const { id } = await context!.params
      const body = await request.json()

      // Call feature handler
      const transaction = await updateTransaction(userId, id, body)

      return NextResponse.json({ transaction })
    } catch (error) {
      console.error('Error in PATCH /api/transactions/[id]:', error)

      if (error instanceof Error && error.message === 'Transaction not found or unauthorized') {
        return NextResponse.json({ message: error.message }, { status: 404 })
      }

      // Zod validation errors
      if (error && typeof error === 'object' && 'issues' in error) {
        return validationError(error)
      }

      return errorResponse('Failed to update transaction', 500, error)
    }
  }
)

/**
 * DELETE /api/transactions/[id]
 * Delete a transaction
 */
export const DELETE = withAuth(
  async (_request: NextRequest, userId: string, context?: { params: Promise<{ id: string }> }) => {
    try {
      const { id } = await context!.params

      // Call feature handler
      await deleteTransaction(userId, id)

      return NextResponse.json({ message: 'Transaction deleted successfully' })
    } catch (error) {
      console.error('Error in DELETE /api/transactions/[id]:', error)

      if (error instanceof Error && error.message === 'Transaction not found or unauthorized') {
        return NextResponse.json({ message: error.message }, { status: 404 })
      }

      return errorResponse('Failed to delete transaction', 500, error)
    }
  }
)
