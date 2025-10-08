/**
 * Individual Transaction API Routes
 * Handles operations on a single transaction
 */
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@repo/db'
import { verifyToken } from '@repo/auth'
import {
  UpdateTransactionSchema,
  convertCurrency,
} from '@repo/utils'

/**
 * GET /api/transactions/[id]
 * Get a single transaction by ID
 */
export async function GET(
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

    // Fetch transaction
    const transaction = await prisma.transaction.findFirst({
      where: {
        id,
        userId: userId, // Ensure user owns the transaction
      },
    })

    if (!transaction) {
      return NextResponse.json(
        { message: 'Transaction not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ transaction })
  } catch (error) {
    console.error('Error fetching transaction:', error)
    return NextResponse.json(
      { message: 'Failed to fetch transaction', error: String(error) },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/transactions/[id]
 * Update a transaction
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

    // Check transaction exists and user owns it
    const existingTransaction = await prisma.transaction.findFirst({
      where: {
        id,
        userId: userId,
      },
    })

    if (!existingTransaction) {
      return NextResponse.json(
        { message: 'Transaction not found' },
        { status: 404 }
      )
    }

    // Parse and validate request body
    const body = await request.json()
    const data = UpdateTransactionSchema.parse(body)

    // Get user's base currency
    const userSettings = await prisma.userSettings.findUnique({
      where: { userId: userId },
    })

    if (!userSettings) {
      return NextResponse.json(
        { message: 'User settings not found' },
        { status: 404 }
      )
    }

    // Prepare update data
    const updateData: any = {
      ...(data.type && { type: data.type }),
      ...(data.category && { category: data.category }),
      ...(data.description !== undefined && { description: data.description }),
      ...(data.date && { date: new Date(data.date) }),
    }

    // If amount or currency changed, recalculate conversion
    if (data.amount !== undefined || data.currency !== undefined) {
      const newAmount = data.amount ?? Number(existingTransaction.amount)
      const newCurrency = data.currency ?? existingTransaction.currency

      const conversion = await convertCurrency(
        newAmount,
        newCurrency,
        userSettings.baseCurrency,
        data.exchangeRate ? Number(data.exchangeRate) : undefined
      )

      updateData.amount = newAmount
      updateData.currency = newCurrency
      updateData.exchangeRate = conversion.rate
      updateData.baseAmount = conversion.convertedAmount
      updateData.baseCurrency = userSettings.baseCurrency
      updateData.rateSource = conversion.source
    }

    // Update transaction
    const transaction = await prisma.transaction.update({
      where: { id },
      data: updateData,
    })

    return NextResponse.json({ transaction })
  } catch (error) {
    console.error('Error updating transaction:', error)
    
    // Zod validation errors
    if (error && typeof error === 'object' && 'issues' in error) {
      return NextResponse.json(
        { message: 'Validation error', errors: error },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { message: 'Failed to update transaction', error: String(error) },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/transactions/[id]
 * Delete a transaction
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

    // Check transaction exists and user owns it
    const existingTransaction = await prisma.transaction.findFirst({
      where: {
        id,
        userId: userId,
      },
    })

    if (!existingTransaction) {
      return NextResponse.json(
        { message: 'Transaction not found' },
        { status: 404 }
      )
    }

    // Delete transaction
    await prisma.transaction.delete({
      where: { id },
    })

    return NextResponse.json({ message: 'Transaction deleted successfully' })
  } catch (error) {
    console.error('Error deleting transaction:', error)
    return NextResponse.json(
      { message: 'Failed to delete transaction', error: String(error) },
      { status: 500 }
    )
  }
}
