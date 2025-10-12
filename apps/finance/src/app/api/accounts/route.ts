import { NextRequest, NextResponse } from "next/server"

import { ApiResponse } from "@repo/types"
import { BadRequestResponse, getJsonInput, SuccessResponse, UnauthorizedResponse } from "@/shared/utils/api"
import { verifyAuth } from "@repo/auth"

import { createAssetAccount, getAllAssetAccounts } from "@/features/accounts/asset"
import { TAccount } from "@repo/db"

export async function POST(request: NextRequest): Promise<NextResponse<ApiResponse<TAccount>>> {
    const { authenticated, userId } = await verifyAuth(request)
    if (!authenticated) return UnauthorizedResponse(userId)

    const jsonInput = await getJsonInput(request)
    if (!jsonInput) return BadRequestResponse(jsonInput)

    try {
        const response = await createAssetAccount(userId, jsonInput)
        return SuccessResponse(response)
    } catch (error) {
        console.error('Error creating asset account:', error)
        return BadRequestResponse<TAccount>(error instanceof Error ? error.message : 'Failed to create asset account')
    }
}

export async function GET(request: NextRequest): Promise<NextResponse<ApiResponse<TAccount[]>>> {
    const { authenticated, userId } = await verifyAuth(request)
    if (!authenticated) return UnauthorizedResponse(userId)

    try {
        const response = await getAllAssetAccounts(userId)
        return SuccessResponse(response)
    } catch (error) {
        console.error('Error getting asset accounts:', error)
        return BadRequestResponse<TAccount[]>(error instanceof Error ? error.message : 'Failed to get asset accounts')
    }
}