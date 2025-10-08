/**
 * Category API Routes
 * Handles CRUD operations for transaction categories
 */
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@repo/db'
import { verifyToken } from '@repo/auth'
import { CreateCategorySchema } from '@repo/utils'

/**
 * GET /api/categories
 * List all categories for the authenticated user
 */
export async function GET(request: NextRequest) {
  try {
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

    // Optional filter by type
    const type = request.nextUrl.searchParams.get('type')

    // Fetch categories
    const categories = await prisma.category.findMany({
      where: {
        userId: userId,
        ...(type && { type }),
      },
      orderBy: { name: 'asc' },
    })

    return NextResponse.json({ categories })
  } catch (error) {
    console.error('Error fetching categories:', error)
    return NextResponse.json(
      { message: 'Failed to fetch categories', error: String(error) },
      { status: 500 }
    )
  }
}

/**
 * POST /api/categories
 * Create a new category
 */
export async function POST(request: NextRequest) {
  try {
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

    // Parse and validate request body
    const body = await request.json()
    const data = CreateCategorySchema.parse(body)

    // Check if category name already exists for this user
    const existing = await prisma.category.findUnique({
      where: {
        userId_name: {
          userId: userId,
          name: data.name,
        },
      },
    })

    if (existing) {
      return NextResponse.json(
        { message: 'Category name already exists' },
        { status: 409 }
      )
    }

    // Create category
    const category = await prisma.category.create({
      data: {
        userId: userId,
        name: data.name,
        type: data.type,
        color: data.color,
        icon: data.icon,
      },
    })

    return NextResponse.json({ category }, { status: 201 })
  } catch (error) {
    console.error('Error creating category:', error)
    
    // Zod validation errors
    if (error && typeof error === 'object' && 'issues' in error) {
      return NextResponse.json(
        { message: 'Validation error', errors: error },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { message: 'Failed to create category', error: String(error) },
      { status: 500 }
    )
  }
}
