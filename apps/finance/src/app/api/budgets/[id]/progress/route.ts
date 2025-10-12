import { NextRequest, NextResponse } from "next/server"
import { ApiResponse } from "@repo/types"
import { BadRequestResponse, SuccessResponse, UnauthorizedResponse } from "@/shared/utils/api"
import { verifyAuth } from "@repo/auth/verify-auth"
import { getBudgetProgress, BudgetProgress } from "@/features/budgets"

/**
 * GET /api/budgets/[id]/progress - Get budget progress (spending calculation)
 */
export async function GET(
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
): Promise<NextResponse<ApiResponse<BudgetProgress>>> {
    const { authenticated, userId } = await verifyAuth(request)
    if (!authenticated) return UnauthorizedResponse(userId)

    const { id } = await context.params

    try {
        const response = await getBudgetProgress(userId, id)
        return SuccessResponse(response)
    } catch (error) {
        console.error('Error getting budget progress:', error)
        return BadRequestResponse<BudgetProgress>(
            error instanceof Error ? error.message : 'Failed to get budget progress'
        )
    }
}

