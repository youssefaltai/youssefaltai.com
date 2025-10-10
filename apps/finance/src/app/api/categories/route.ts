/**
 * Category API Routes
 * Thin wrapper around feature handlers
 */
import { NextRequest, NextResponse } from 'next/server'
import { withAuth, errorResponse, validationError } from '@repo/auth/api-middleware'
import { getCategories } from '@/features/categories/api/get-categories'
import { createCategory } from '@/features/categories/api/create-category'

/**
 * GET /api/categories
 * List all categories for the authenticated user
 */
export const GET = withAuth(async (request: NextRequest, userId: string) => {
  try {
    // Optional filter by type
    const type = request.nextUrl.searchParams.get('type') as 'income' | 'expense' | null

    // Call feature handler
    const categories = await getCategories(userId, type || undefined)

    return NextResponse.json({ categories })
  } catch (error) {
    console.error('Error in GET /api/categories:', error)
    return errorResponse('Failed to fetch categories', 500, error)
  }
})

/**
 * POST /api/categories
 * Create a new category
 */
export const POST = withAuth(async (request: NextRequest, userId: string) => {
  try {
    // Parse request body
    const body = await request.json()

    // Call feature handler
    const category = await createCategory(userId, body)

    return NextResponse.json({ category }, { status: 201 })
  } catch (error) {
    console.error('Error in POST /api/categories:', error)

    if (error instanceof Error && error.message === 'Category name already exists') {
      return NextResponse.json({ message: error.message }, { status: 409 })
    }

    // Zod validation errors
    if (error && typeof error === 'object' && 'issues' in error) {
      return validationError(error)
    }

    return errorResponse('Failed to create category', 500, error)
  }
})
