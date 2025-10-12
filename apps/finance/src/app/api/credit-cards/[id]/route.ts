import { NextRequest, NextResponse } from "next/server"

import { ApiResponse } from "@repo/types"
import { BadRequestResponse, getJsonInput, SuccessResponse, UnauthorizedResponse } from "@/shared/utils/api"
import { verifyAuth } from "@repo/auth"

import { getCreditCard, updateCreditCard, deleteCreditCard } from "@/features/accounts/credit-card"
import { TAccount } from "@repo/db"

interface RouteContext {
    params: Promise<{ id: string }>
}

export async function GET(request: NextRequest, { params }: RouteContext): Promise<NextResponse<ApiResponse<TAccount>>> {
    const { authenticated, userId } = await verifyAuth(request)
    if (!authenticated) return UnauthorizedResponse(userId)

    const { id: accountId } = await params

    try {
        const response = await getCreditCard(accountId, userId)
        return SuccessResponse(response)
    } catch (error) {
        console.error('Error getting credit card:', error)
        return BadRequestResponse<TAccount>(error instanceof Error ? error.message : 'Failed to get credit card')
    }
}

export async function PATCH(request: NextRequest, { params }: RouteContext): Promise<NextResponse<ApiResponse<TAccount>>> {
    const { authenticated, userId } = await verifyAuth(request)
    if (!authenticated) return UnauthorizedResponse(userId)

    const { id: accountId } = await params
    const jsonInput = await getJsonInput(request)
    if (!jsonInput) return BadRequestResponse(jsonInput)

    try {
        const response = await updateCreditCard(accountId, userId, jsonInput)
        return SuccessResponse(response)
    } catch (error) {
        console.error('Error updating credit card:', error)
        return BadRequestResponse<TAccount>(error instanceof Error ? error.message : 'Failed to update credit card')
    }
}

export async function DELETE(request: NextRequest, { params }: RouteContext): Promise<NextResponse<ApiResponse<{ message: string }>>> {
    const { authenticated, userId } = await verifyAuth(request)
    if (!authenticated) return UnauthorizedResponse(userId)

    const { id: accountId } = await params

    try {
        const response = await deleteCreditCard(accountId, userId)
        return SuccessResponse(response)
    } catch (error) {
        console.error('Error deleting credit card:', error)
        return BadRequestResponse<{ message: string }>(error instanceof Error ? error.message : 'Failed to delete credit card')
    }
}

