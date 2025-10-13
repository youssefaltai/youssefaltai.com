import { NextRequest, NextResponse } from "next/server"

import { ApiResponse } from "@repo/types"
import { BadRequestResponse, SuccessResponse, UnauthorizedResponse } from "@/shared/utils/api"
import { verifyAuth } from "@repo/auth/verify-auth"

import { getAllAccounts } from "@/features/accounts/shared/get-all-accounts"
import { TAccount, AccountType } from "@repo/db"

/**
 * GET /api/accounts
 * Returns all accounts for the authenticated user
 * Supports optional ?type=<AccountType> query parameter to filter by type
 */
export async function GET(request: NextRequest): Promise<NextResponse<ApiResponse<TAccount[]>>> {
    const { authenticated, userId } = await verifyAuth()
    if (!authenticated) return UnauthorizedResponse(userId)

    try {
        // Check for optional type filter
        const { searchParams } = new URL(request.url)
        const type = searchParams.get('type') as AccountType | null

        const response = await getAllAccounts(userId, type || undefined)
        return SuccessResponse(response)
    } catch (error) {
        console.error('Error getting accounts:', error)
        return BadRequestResponse<TAccount[]>(error instanceof Error ? error.message : 'Failed to get accounts')
    }
}