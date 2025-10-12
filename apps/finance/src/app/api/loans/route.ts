import { NextRequest, NextResponse } from "next/server"

import { ApiResponse } from "@repo/types"
import { BadRequestResponse, getJsonInput, SuccessResponse, UnauthorizedResponse } from "@/shared/utils/api"
import { verifyAuth } from "@repo/auth"

import { createLoan, getAllLoans } from "@/features/accounts/loan"
import { TAccount } from "@repo/db"

export async function POST(request: NextRequest): Promise<NextResponse<ApiResponse<TAccount>>> {
    const { authenticated, userId } = await verifyAuth(request)
    if (!authenticated) return UnauthorizedResponse(userId)

    const jsonInput = await getJsonInput(request)
    if (!jsonInput) return BadRequestResponse(jsonInput)

    try {
        const response = await createLoan(userId, jsonInput)
        return SuccessResponse(response)
    } catch (error) {
        console.error('Error creating loan:', error)
        return BadRequestResponse<TAccount>(error instanceof Error ? error.message : 'Failed to create loan')
    }
}

export async function GET(request: NextRequest): Promise<NextResponse<ApiResponse<TAccount[]>>> {
    const { authenticated, userId } = await verifyAuth(request)
    if (!authenticated) return UnauthorizedResponse(userId)

    try {
        const response = await getAllLoans(userId)
        return SuccessResponse(response)
    } catch (error) {
        console.error('Error getting loans:', error)
        return BadRequestResponse<TAccount[]>(error instanceof Error ? error.message : 'Failed to get loans')
    }
}

