/**
 * Individual Category API Routes
 * Handles operations on a single category
 */
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@repo/db'
import { verifyToken } from '@repo/auth'
import { UpdateCategorySchema } from '@repo/utils'

/**
 * PUT /api/categories/[id]
 * Update a category
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Await params (Next.js 15 requirement)
    const { id } = await params
    
    // Verify authentication
    const token = request.cookies.get('auth_token')?.value
    if (!token) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const payload = await verifyToken(token)
    if (!payload?.id) {
      return NextResponse.json({ message: 'Invalid token' }, { status: 401 })
    }
    
    const userId = payload.id

    // Check category exists and user owns it
    const existingCategory = await prisma.category.findFirst({
      where: {
        id,
        userId: userId,
      },
    })

    if (!existingCategory) {
      return NextResponse.json(
        { message: 'Category not found' },
        { status: 404 }
      )
    }

    // Parse and validate request body
    const body = await request.json()
    const data = UpdateCategorySchema.parse(body)

    // If name is being changed, check it doesn't conflict
    if (data.name && data.name !== existingCategory.name) {
      const nameConflict = await prisma.category.findUnique({
        where: {
          userId_name: {
            userId: userId,
            name: data.name,
          },
        },
      })

      if (nameConflict) {
        return NextResponse.json(
          { message: 'Category name already exists' },
          { status: 409 }
        )
      }
    }

    // Update category
    const category = await prisma.category.update({
      where: { id },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.type && { type: data.type }),
        ...(data.color !== undefined && { color: data.color }),
        ...(data.icon !== undefined && { icon: data.icon }),
      },
    })

    return NextResponse.json({ category })
  } catch (error) {
    console.error('Error updating category:', error)
    
    // Zod validation errors
    if (error && typeof error === 'object' && 'issues' in error) {
      return NextResponse.json(
        { message: 'Validation error', errors: error },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { message: 'Failed to update category', error: String(error) },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/categories/[id]
 * Delete a category
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Await params (Next.js 15 requirement)
    const { id } = await params
    
    // Verify authentication
    const token = request.cookies.get('auth_token')?.value
    if (!token) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const payload = await verifyToken(token)
    if (!payload?.id) {
      return NextResponse.json({ message: 'Invalid token' }, { status: 401 })
    }
    
    const userId = payload.id

    // Check category exists and user owns it
    const existingCategory = await prisma.category.findFirst({
      where: {
        id,
        userId: userId,
      },
    })

    if (!existingCategory) {
      return NextResponse.json(
        { message: 'Category not found' },
        { status: 404 }
      )
    }

    // Check if category is in use
    const transactionCount = await prisma.transaction.count({
      where: {
        userId: userId,
        category: existingCategory.name,
      },
    })

    if (transactionCount > 0) {
      return NextResponse.json(
        { message: `Cannot delete category. ${transactionCount} transaction(s) are using it.` },
        { status: 409 }
      )
    }

    // Delete category
    await prisma.category.delete({
      where: { id },
    })

    return NextResponse.json({ message: 'Category deleted successfully' })
  } catch (error) {
    console.error('Error deleting category:', error)
    return NextResponse.json(
      { message: 'Failed to delete category', error: String(error) },
      { status: 500 }
    )
  }
}
