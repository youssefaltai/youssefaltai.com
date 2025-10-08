/**
 * Transaction API Routes
 * Handles CRUD operations for financial transactions
 */
import { NextRequest, NextResponse } from 'next/server'
import { prisma, Prisma } from '@repo/db'
import { verifyToken } from '@repo/auth'
import {
  CreateTransactionSchema,
  TransactionFiltersSchema,
  convertCurrency,
} from '@repo/utils'

/**
 * GET /api/transactions
 * List transactions with optional filters
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

    // Parse query parameters
    const searchParams = request.nextUrl.searchParams
    const filters = TransactionFiltersSchema.parse({
      type: searchParams.get('type') || undefined,
      category: searchParams.get('category') || undefined,
      currency: searchParams.get('currency') || undefined,
      dateFrom: searchParams.get('dateFrom') || undefined,
      dateTo: searchParams.get('dateTo') || undefined,
      page: searchParams.get('page') ? parseInt(searchParams.get('page')!) : 1,
      limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 50,
    })

    // Build query conditions
    const where: Prisma.TransactionWhereInput = {
      userId,
      ...(filters.type && { type: filters.type }),
      ...(filters.category && { category: filters.category }),
      ...(filters.currency && { currency: filters.currency }),
      ...(filters.dateFrom || filters.dateTo ? {
        date: {
          ...(filters.dateFrom && { gte: new Date(filters.dateFrom) }),
          ...(filters.dateTo && { lte: new Date(filters.dateTo) }),
        }
      } : {}),
    }

    // Calculate pagination
    const page = filters.page || 1
    const limit = filters.limit || 50
    const skip = (page - 1) * limit

    // Fetch transactions
    const [transactions, total] = await Promise.all([
      prisma.transaction.findMany({
        where,
        orderBy: { date: 'desc' },
        skip,
        take: limit,
      }),
      prisma.transaction.count({ where }),
    ])

    return NextResponse.json({
      transactions,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Error fetching transactions:', error)
    return NextResponse.json(
      { message: 'Failed to fetch transactions', error: String(error) },
      { status: 500 }
    )
  }
}

/**
 * POST /api/transactions
 * Create a new transaction
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
    const data = CreateTransactionSchema.parse(body)

    // Get user's base currency
    let userSettings = await prisma.userSettings.findUnique({
      where: { userId },
    })

    // Create default settings if not exists
    if (!userSettings) {
      userSettings = await prisma.userSettings.create({
        data: {
          userId,
          baseCurrency: 'EUR', // Default to EUR
        },
      })
    }

    // Convert currency if needed
    const conversion = await convertCurrency(
      Number(data.amount),
      data.currency,
      userSettings.baseCurrency,
      data.exchangeRate ? Number(data.exchangeRate) : undefined
    )

    // Create transaction
    const transaction = await prisma.transaction.create({
      data: {
        userId,
        amount: data.amount,
        currency: data.currency,
        exchangeRate: conversion.rate,
        baseAmount: conversion.convertedAmount,
        baseCurrency: userSettings.baseCurrency,
        rateSource: conversion.source,
        type: data.type,
        category: data.category,
        description: data.description,
        date: new Date(data.date),
      },
    })

    return NextResponse.json({ transaction }, { status: 201 })
  } catch (error) {
    console.error('Error creating transaction:', error)
    
    // Zod validation errors
    if (error && typeof error === 'object' && 'issues' in error) {
      return NextResponse.json(
        { message: 'Validation error', errors: error },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { message: 'Failed to create transaction', error: String(error) },
      { status: 500 }
    )
  }
}
