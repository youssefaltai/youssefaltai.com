/**
 * Category [id] API Routes
 * Thin wrapper around feature handlers
 */
import { NextRequest, NextResponse } from 'next/server'
import { withAuth, errorResponse, validationError } from '@repo/auth/api-middleware'
import { updateCategory } from '@/features/categories/api/update-category'
import { deleteCategory } from '@/features/categories/api/delete-category'

/**
 * PATCH /api/categories/[id]
 * Update an existing category
 */
export const PATCH = withAuth(
  async (request: NextRequest, userId: string, context?: { params: Promise<{ id: string }> }) => {
    try {
      const { id } = await context!.params
      const body = await request.json()

      // Call feature handler
      const category = await updateCategory(userId, id, body)

      return NextResponse.json({ category })
    } catch (error) {
      console.error('Error in PATCH /api/categories/[id]:', error)

      if (
        error instanceof Error &&
        (error.message === 'Category not found or unauthorized' ||
          error.message === 'Category name already exists')
      ) {
        const status = error.message === 'Category name already exists' ? 409 : 404
        return NextResponse.json({ message: error.message }, { status })
      }

      // Zod validation errors
      if (error && typeof error === 'object' && 'issues' in error) {
        return validationError(error)
      }

      return errorResponse('Failed to update category', 500, error)
    }
  }
)

/**
 * DELETE /api/categories/[id]
 * Delete a category
 */
export const DELETE = withAuth(
  async (_request: NextRequest, userId: string, context?: { params: Promise<{ id: string }> }) => {
    try {
      const { id } = await context!.params

      // Call feature handler
      await deleteCategory(userId, id)

      return NextResponse.json({ message: 'Category deleted successfully' })
    } catch (error) {
      console.error('Error in DELETE /api/categories/[id]:', error)

      if (error instanceof Error && error.message === 'Category not found or unauthorized') {
        return NextResponse.json({ message: error.message }, { status: 404 })
      }

      return errorResponse('Failed to delete category', 500, error)
    }
  }
)
