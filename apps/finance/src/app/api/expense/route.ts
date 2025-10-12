import { NextRequest, NextResponse } from "next/server"

import { ApiResponse } from "@repo/types"
import { BadRequestResponse, getJsonInput, SuccessResponse, UnauthorizedResponse } from "@/shared/utils/api"
import { verifyAuth } from "@repo/auth/verify-auth"

import { createExpenseCategory, getAllExpenseCategories } from "@/features/accounts/expense"
import { TAccount } from "@repo/db"

export async function POST(request: NextRequest): Promise<NextResponse<ApiResponse<TAccount>>> {
    const { authenticated, userId } = await verifyAuth(request)
    if (!authenticated) return UnauthorizedResponse(userId)

    const jsonInput = await getJsonInput(request)
    if (!jsonInput) return BadRequestResponse(jsonInput)

    try {
        const response = await createExpenseCategory(userId, jsonInput)
        return SuccessResponse(response)
    } catch (error) {
        console.error('Error creating expense category:', error)
        return BadRequestResponse<TAccount>(error instanceof Error ? error.message : 'Failed to create expense category')
    }
}

export async function GET(request: NextRequest): Promise<NextResponse<ApiResponse<TAccount[]>>> {
    const { authenticated, userId } = await verifyAuth(request)
    if (!authenticated) return UnauthorizedResponse(userId)

    try {
        const response = await getAllExpenseCategories(userId)
        return SuccessResponse(response)
    } catch (error) {
        console.error('Error getting expense categories:', error)
        return BadRequestResponse<TAccount[]>(error instanceof Error ? error.message : 'Failed to get expense categories')
    }
}

