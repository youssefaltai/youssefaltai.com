import { NextRequest, NextResponse } from "next/server"
import { verifyAuth } from "@repo/auth/verify-auth"
import { ApiResponse } from "@repo/types"
import { BadRequestResponse, SuccessResponse, UnauthorizedResponse } from "@/shared/utils/api"
import { getTransactionsSummaryQuerySchema } from "@/features/transactions/validation"
import getTransactionsSummary, { TransactionSummary } from "@/features/transactions/api/get-transactions-summary"

/**
 * GET /api/transactions/summary
 * Get aggregated transaction summary (income, expenses, transfers)
 * Server-side aggregation for performance - returns only totals, not full transactions
 * 
 * Query parameters:
 * - dateFrom (required): ISO datetime string
 * - dateTo (required): ISO datetime string
 * - accountIds (optional): Array of account IDs to filter by
 * 
 * Returns:
 * - totalIncome: Total income amount
 * - totalExpenses: Total expense amount
 * - totalTransfers: Total transfer amount
 * - transactionCount: Total number of transactions
 * - incomeCount: Number of income transactions
 * - expenseCount: Number of expense transactions
 * - transferCount: Number of transfer transactions
 */
export async function GET(request: NextRequest): Promise<NextResponse<ApiResponse<TransactionSummary>>> {
    const { authenticated, userId } = await verifyAuth(request)
    if (!authenticated) return UnauthorizedResponse(userId)

    try {
        // Parse query parameters from URL
        const { searchParams } = new URL(request.url)
        
        // Extract and convert query parameters
        const rawFilters: Record<string, unknown> = {
            dateFrom: searchParams.get('dateFrom') || undefined,
            dateTo: searchParams.get('dateTo') || undefined,
            accountIds: searchParams.getAll('accountIds').filter(Boolean),
        }

        // Remove undefined values for cleaner validation
        Object.keys(rawFilters).forEach(key => {
            if (rawFilters[key] === undefined || (Array.isArray(rawFilters[key]) && rawFilters[key].length === 0)) {
                delete rawFilters[key]
            }
        })

        // Validate with Zod schema
        const validatedFilters = getTransactionsSummaryQuerySchema.parse(rawFilters)

        // Fetch summary with server-side aggregation
        const response = await getTransactionsSummary(userId, validatedFilters)

        return SuccessResponse(response)
    } catch (error) {
        console.error('Error getting transaction summary:', error)
        return BadRequestResponse<TransactionSummary>(
            error instanceof Error ? error.message : 'Failed to get transaction summary'
        )
    }
}

