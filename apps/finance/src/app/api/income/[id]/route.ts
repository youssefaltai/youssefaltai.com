import { NextRequest, NextResponse } from "next/server"

import { ApiResponse } from "@repo/types"
import { BadRequestResponse, getJsonInput, SuccessResponse, UnauthorizedResponse } from "@/shared/utils/api"
import { verifyAuth } from "@repo/auth"

import { getIncomeSource, updateIncomeSource, deleteIncomeSource } from "@/features/accounts/income"
import { TAccount } from "@repo/db"

interface RouteContext {
    params: Promise<{ id: string }>
}

export async function GET(request: NextRequest, { params }: RouteContext): Promise<NextResponse<ApiResponse<TAccount>>> {
    const { authenticated, userId } = await verifyAuth(request)
    if (!authenticated) return UnauthorizedResponse(userId)

    const { id: accountId } = await params

    try {
        const response = await getIncomeSource(accountId, userId)
        return SuccessResponse(response)
    } catch (error) {
        console.error('Error getting income source:', error)
        return BadRequestResponse<TAccount>(error instanceof Error ? error.message : 'Failed to get income source')
    }
}

export async function PATCH(request: NextRequest, { params }: RouteContext): Promise<NextResponse<ApiResponse<TAccount>>> {
    const { authenticated, userId } = await verifyAuth(request)
    if (!authenticated) return UnauthorizedResponse(userId)

    const { id: accountId } = await params
    const jsonInput = await getJsonInput(request)
    if (!jsonInput) return BadRequestResponse(jsonInput)

    try {
        const response = await updateIncomeSource(accountId, userId, jsonInput)
        return SuccessResponse(response)
    } catch (error) {
        console.error('Error updating income source:', error)
        return BadRequestResponse<TAccount>(error instanceof Error ? error.message : 'Failed to update income source')
    }
}

export async function DELETE(request: NextRequest, { params }: RouteContext): Promise<NextResponse<ApiResponse<{ message: string }>>> {
    const { authenticated, userId } = await verifyAuth(request)
    if (!authenticated) return UnauthorizedResponse(userId)

    const { id: accountId } = await params

    try {
        const response = await deleteIncomeSource(accountId, userId)
        return SuccessResponse(response)
    } catch (error) {
        console.error('Error deleting income source:', error)
        return BadRequestResponse<{ message: string }>(error instanceof Error ? error.message : 'Failed to delete income source')
    }
}

