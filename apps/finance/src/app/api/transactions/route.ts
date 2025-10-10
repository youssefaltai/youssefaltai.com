/**
 * Transaction API Routes
 * Thin wrapper around feature handlers
 */
import { NextRequest, NextResponse } from 'next/server'
import { withAuth, errorResponse, validationError } from '@repo/auth/api-middleware'
import { getTransactions } from '@/features/transactions/api/get-transactions'
import { createTransaction } from '@/features/transactions/api/create-transaction'

/**
 * GET /api/transactions
 * List transactions with optional filters
 */
export const GET = withAuth(async (request: NextRequest, userId: string) => {
  try {
    // Parse query parameters
    const searchParams = request.nextUrl.searchParams
    const filters = {
      type: (searchParams.get('type') as 'income' | 'expense' | null) || undefined,
      category: searchParams.get('category') || undefined,
      currency: (searchParams.get('currency') as 'EGP' | 'USD' | 'GOLD_G' | null) || undefined,
      dateFrom: searchParams.get('dateFrom') || undefined,
      dateTo: searchParams.get('dateTo') || undefined,
      page: searchParams.get('page') ? parseInt(searchParams.get('page')!) : 1,
      limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 50,
    }

    // Call feature handler
    const result = await getTransactions(userId, filters)

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error in GET /api/transactions:', error)
    return errorResponse('Failed to fetch transactions', 500, error)
  }
})

/**
 * POST /api/transactions
 * Create a new transaction
 */
export const POST = withAuth(async (request: NextRequest, userId: string) => {
  try {
    // Parse request body
    const body = await request.json()

    // Call feature handler
    const transaction = await createTransaction(userId, body)

    return NextResponse.json({ transaction }, { status: 201 })
  } catch (error) {
    console.error('Error in POST /api/transactions:', error)

    // Zod validation errors
    if (error && typeof error === 'object' && 'issues' in error) {
      return validationError(error)
    }

    return errorResponse('Failed to create transaction', 500, error)
  }
})
