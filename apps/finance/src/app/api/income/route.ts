import { NextRequest, NextResponse } from "next/server"

import { ApiResponse } from "@repo/types"
import { BadRequestResponse, getJsonInput, SuccessResponse, UnauthorizedResponse } from "@/shared/utils/api"
import { verifyAuth } from "@repo/auth"

import { createIncomeSource, getAllIncomeSources } from "@/features/accounts/income"
import { TAccount } from "@repo/db"

export async function POST(request: NextRequest): Promise<NextResponse<ApiResponse<TAccount>>> {
    const { authenticated, userId } = await verifyAuth(request)
    if (!authenticated) return UnauthorizedResponse(userId)

    const jsonInput = await getJsonInput(request)
    if (!jsonInput) return BadRequestResponse(jsonInput)

    try {
        const response = await createIncomeSource(userId, jsonInput)
        return SuccessResponse(response)
    } catch (error) {
        console.error('Error creating income source:', error)
        return BadRequestResponse<TAccount>(error instanceof Error ? error.message : 'Failed to create income source')
    }
}

export async function GET(request: NextRequest): Promise<NextResponse<ApiResponse<TAccount[]>>> {
    const { authenticated, userId } = await verifyAuth(request)
    if (!authenticated) return UnauthorizedResponse(userId)

    try {
        const response = await getAllIncomeSources(userId)
        return SuccessResponse(response)
    } catch (error) {
        console.error('Error getting income sources:', error)
        return BadRequestResponse<TAccount[]>(error instanceof Error ? error.message : 'Failed to get income sources')
    }
}

