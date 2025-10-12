import { NextRequest, NextResponse } from "next/server"

import { ApiResponse, PaginatedResponse } from "@repo/types"
import { BadRequestResponse, getJsonInput, SuccessResponse, UnauthorizedResponse } from "@/shared/utils/api"
import { verifyAuth } from "@repo/auth/verify-auth"
import { TTransaction } from "@repo/db"
import createTransaction from "@/features/transactions/api/create-transaction"
import getTransactions from "@/features/transactions/api/get-transactions"
import { getTransactionsQuerySchema } from "@/features/transactions/validation"

export async function POST(request: NextRequest): Promise<NextResponse<ApiResponse<TTransaction>>> {
    const { authenticated, userId } = await verifyAuth(request)
    if (!authenticated) return UnauthorizedResponse(userId)

    const jsonInput = await getJsonInput(request)
    if (!jsonInput) return BadRequestResponse(jsonInput)

    try {
        const response = await createTransaction(userId, jsonInput)
        return SuccessResponse(response)
    } catch (error) {
        console.error('Error creating transaction:', error)
        return BadRequestResponse<TTransaction>(error instanceof Error ? error.message : 'Failed to create transaction')
    }
}

export async function GET(request: NextRequest): Promise<NextResponse<ApiResponse<PaginatedResponse<TTransaction>>>> {
    const { authenticated, userId } = await verifyAuth(request)
    if (!authenticated) return UnauthorizedResponse(userId)

    try {
        // Parse query parameters from URL
        const { searchParams } = new URL(request.url)
        
        // Extract and convert query parameters
        const rawFilters: Record<string, any> = {
            dateFrom: searchParams.get('dateFrom') || undefined,
            dateTo: searchParams.get('dateTo') || undefined,
            accountIds: searchParams.getAll('accountIds').filter(Boolean),
            minAmount: searchParams.get('minAmount') ? parseFloat(searchParams.get('minAmount')!) : undefined,
            maxAmount: searchParams.get('maxAmount') ? parseFloat(searchParams.get('maxAmount')!) : undefined,
            type: searchParams.get('type') || undefined,
            search: searchParams.get('search') || undefined,
            page: searchParams.get('page') ? parseInt(searchParams.get('page')!) : undefined,
            limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined,
            sortBy: searchParams.get('sortBy') || undefined,
            sortOrder: searchParams.get('sortOrder') || undefined,
        }

        // Remove undefined values for cleaner validation
        Object.keys(rawFilters).forEach(key => {
            if (rawFilters[key] === undefined || (Array.isArray(rawFilters[key]) && rawFilters[key].length === 0)) {
                delete rawFilters[key]
            }
        })

        // Validate with Zod schema (provides defaults for page, limit, sortBy, sortOrder)
        const validatedFilters = getTransactionsQuerySchema.parse(rawFilters)

        // Fetch transactions with filters
        const response = await getTransactions(userId, validatedFilters)
        
        return SuccessResponse(response)
    } catch (error) {
        console.error('Error getting transactions:', error)
        return BadRequestResponse<PaginatedResponse<TTransaction>>(
            error instanceof Error ? error.message : 'Failed to get transactions'
        )
    }
}
