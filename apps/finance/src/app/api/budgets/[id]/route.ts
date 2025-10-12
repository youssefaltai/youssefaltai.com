import { NextRequest, NextResponse } from "next/server"
import { ApiResponse } from "@repo/types"
import {
    BadRequestResponse,
    getJsonInput,
    SuccessResponse,
    UnauthorizedResponse,
} from "@/shared/utils/api"
import { verifyAuth } from "@repo/auth/verify-auth"
import { getBudget, updateBudget, deleteBudget } from "@/features/budgets"

/**
 * GET /api/budgets/[id] - Get a budget by ID
 */
export async function GET(
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
): Promise<NextResponse<ApiResponse<any>>> {
    const { authenticated, userId } = await verifyAuth(request)
    if (!authenticated) return UnauthorizedResponse(userId)

    const { id } = await context.params

    try {
        const response = await getBudget(userId, id)
        return SuccessResponse(response)
    } catch (error) {
        console.error('Error getting budget:', error)
        return BadRequestResponse<any>(
            error instanceof Error ? error.message : 'Failed to get budget'
        )
    }
}

/**
 * PATCH /api/budgets/[id] - Update a budget
 */
export async function PATCH(
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
): Promise<NextResponse<ApiResponse<any>>> {
    const { authenticated, userId } = await verifyAuth(request)
    if (!authenticated) return UnauthorizedResponse(userId)

    const { id } = await context.params

    const jsonInput = await getJsonInput(request)
    if (!jsonInput) return BadRequestResponse(jsonInput)

    try {
        const response = await updateBudget(userId, id, jsonInput)
        return SuccessResponse(response)
    } catch (error) {
        console.error('Error updating budget:', error)
        return BadRequestResponse<any>(
            error instanceof Error ? error.message : 'Failed to update budget'
        )
    }
}

/**
 * DELETE /api/budgets/[id] - Delete a budget
 */
export async function DELETE(
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
): Promise<NextResponse<ApiResponse<any>>> {
    const { authenticated, userId } = await verifyAuth(request)
    if (!authenticated) return UnauthorizedResponse(userId)

    const { id } = await context.params

    try {
        const response = await deleteBudget(userId, id)
        return SuccessResponse(response)
    } catch (error) {
        console.error('Error deleting budget:', error)
        return BadRequestResponse<any>(
            error instanceof Error ? error.message : 'Failed to delete budget'
        )
    }
}

