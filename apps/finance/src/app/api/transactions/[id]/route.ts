import deleteTransaction from "@/features/transactions/api/delete-transaction"
import updateTransaction from "@/features/transactions/api/update-transaction"
import { BadRequestResponse, getJsonInput, SuccessResponse, UnauthorizedResponse } from "@/shared/utils/api"
import { verifyAuth } from "@repo/auth"
import { TTransaction } from "@repo/db"
import { ApiResponse } from "@repo/types"
import { NextRequest, NextResponse } from "next/server"

interface RouteContext {
    params: Promise<{ id: string }>
}

export async function PATCH(request: NextRequest, { params }: RouteContext): Promise<NextResponse<ApiResponse<TTransaction>>> {
    const { authenticated, userId } = await verifyAuth(request)
    if (!authenticated) return UnauthorizedResponse(userId)

    const { id: transactionId } = await params;
    const jsonInput = await getJsonInput(request);
    if (!jsonInput) return BadRequestResponse(null)

    try {
        const response = await updateTransaction(userId, transactionId, jsonInput);
        return SuccessResponse(response)
    } catch (error) {
        console.error('Error updating transaction:', error)
        return BadRequestResponse<TTransaction>(error instanceof Error ? error.message : 'Failed to update transaction')
    }
}

export async function DELETE(request: NextRequest, { params }: RouteContext): Promise<NextResponse<ApiResponse<TTransaction>>> {
    const { authenticated, userId } = await verifyAuth(request)
    if (!authenticated) return UnauthorizedResponse(userId)

    const { id: transactionId } = await params;

    try {
        const response = await deleteTransaction(userId, transactionId);
        return SuccessResponse(response)
    } catch (error) {
        console.error('Error deleting transaction:', error)
        return BadRequestResponse<TTransaction>(error instanceof Error ? error.message : 'Failed to delete transaction')
    }
}