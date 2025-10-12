import { NextRequest, NextResponse } from "next/server"
import { ApiResponse } from "@repo/types"
import {
    BadRequestResponse,
    getJsonInput,
    SuccessResponse,
    UnauthorizedResponse,
} from "@/shared/utils/api"
import { verifyAuth } from "@repo/auth/verify-auth"
import { createBudget, getAllBudgets } from "@/features/budgets"

type BudgetResponse = Awaited<ReturnType<typeof createBudget>>

/**
 * POST /api/budgets - Create a new budget
 */
export async function POST(request: NextRequest): Promise<NextResponse<ApiResponse<BudgetResponse>>> {
    const { authenticated, userId } = await verifyAuth(request)
    if (!authenticated) return UnauthorizedResponse(userId)

    const jsonInput = await getJsonInput(request)
    if (!jsonInput) return BadRequestResponse(jsonInput)

    try {
        const response = await createBudget(userId, jsonInput)
        return SuccessResponse(response)
    } catch (error) {
        console.error('Error creating budget:', error)
        return BadRequestResponse<BudgetResponse>(
            error instanceof Error ? error.message : 'Failed to create budget'
        )
    }
}

/**
 * GET /api/budgets - Get all budgets
 */
export async function GET(request: NextRequest): Promise<NextResponse<ApiResponse<BudgetResponse[]>>> {
    const { authenticated, userId } = await verifyAuth(request)
    if (!authenticated) return UnauthorizedResponse(userId)

    try {
        const response = await getAllBudgets(userId)
        return SuccessResponse(response)
    } catch (error) {
        console.error('Error getting budgets:', error)
        return BadRequestResponse<BudgetResponse[]>(
            error instanceof Error ? error.message : 'Failed to get budgets'
        )
    }
}

