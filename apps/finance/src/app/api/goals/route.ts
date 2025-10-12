import { NextRequest, NextResponse } from "next/server"

import { ApiResponse } from "@repo/types"
import { BadRequestResponse, getJsonInput, SuccessResponse, UnauthorizedResponse } from "@/shared/utils/api"
import { verifyAuth } from "@repo/auth"

import { createGoal, getAllGoals } from "@/features/accounts/goal"
import { TAccount } from "@repo/db"

export async function POST(request: NextRequest): Promise<NextResponse<ApiResponse<TAccount>>> {
    const { authenticated, userId } = await verifyAuth(request)
    if (!authenticated) return UnauthorizedResponse(userId)

    const jsonInput = await getJsonInput(request)
    if (!jsonInput) return BadRequestResponse(jsonInput)

    try {
        const response = await createGoal(userId, jsonInput)
        return SuccessResponse(response)
    } catch (error) {
        console.error('Error creating goal:', error)
        return BadRequestResponse<TAccount>(error instanceof Error ? error.message : 'Failed to create goal')
    }
}

export async function GET(request: NextRequest): Promise<NextResponse<ApiResponse<TAccount[]>>> {
    const { authenticated, userId } = await verifyAuth(request)
    if (!authenticated) return UnauthorizedResponse(userId)

    try {
        const response = await getAllGoals(userId)
        return SuccessResponse(response)
    } catch (error) {
        console.error('Error getting goals:', error)
        return BadRequestResponse<TAccount[]>(error instanceof Error ? error.message : 'Failed to get goals')
    }
}

