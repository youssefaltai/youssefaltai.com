import { NextRequest, NextResponse } from "next/server"

import { ApiResponse } from "@repo/types"
import { BadRequestResponse, getJsonInput, SuccessResponse, UnauthorizedResponse } from "@/shared/utils/api"
import { verifyAuth } from "@repo/auth"
import { TTransaction } from "@repo/db"
import createTransaction from "@/features/transactions/api/create-transaction"
import getTransactions from "@/features/transactions/api/get-transactions"

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

export async function GET(request: NextRequest): Promise<NextResponse<ApiResponse<TTransaction[]>>> {
    const { authenticated, userId } = await verifyAuth(request)
    if (!authenticated) return UnauthorizedResponse(userId)

    try {
        const response = await getTransactions(userId)
        return SuccessResponse(response)
    } catch (error) {
        console.error('Error getting transactions:', error)
        return BadRequestResponse<TTransaction[]>(error instanceof Error ? error.message : 'Failed to get transactions')
    }
}
