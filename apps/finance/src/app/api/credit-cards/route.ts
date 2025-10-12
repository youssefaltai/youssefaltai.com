import { NextRequest, NextResponse } from "next/server"

import { ApiResponse } from "@repo/types"
import { BadRequestResponse, getJsonInput, SuccessResponse, UnauthorizedResponse } from "@/shared/utils/api"
import { verifyAuth } from "@repo/auth/verify-auth"

import { createCreditCard, getAllCreditCards } from "@/features/accounts/credit-card"
import { TAccount } from "@repo/db"

export async function POST(request: NextRequest): Promise<NextResponse<ApiResponse<TAccount>>> {
    const { authenticated, userId } = await verifyAuth(request)
    if (!authenticated) return UnauthorizedResponse(userId)

    const jsonInput = await getJsonInput(request)
    if (!jsonInput) return BadRequestResponse(jsonInput)

    try {
        const response = await createCreditCard(userId, jsonInput)
        return SuccessResponse(response)
    } catch (error) {
        console.error('Error creating credit card:', error)
        return BadRequestResponse<TAccount>(error instanceof Error ? error.message : 'Failed to create credit card')
    }
}

export async function GET(request: NextRequest): Promise<NextResponse<ApiResponse<TAccount[]>>> {
    const { authenticated, userId } = await verifyAuth(request)
    if (!authenticated) return UnauthorizedResponse(userId)

    try {
        const response = await getAllCreditCards(userId)
        return SuccessResponse(response)
    } catch (error) {
        console.error('Error getting credit cards:', error)
        return BadRequestResponse<TAccount[]>(error instanceof Error ? error.message : 'Failed to get credit cards')
    }
}

