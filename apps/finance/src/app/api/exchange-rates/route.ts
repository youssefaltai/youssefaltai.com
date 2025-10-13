import { NextRequest, NextResponse } from "next/server"
import { verifyAuth } from "@repo/auth/verify-auth"
import { ApiResponse } from "@repo/types"
import { BadRequestResponse, getJsonInput, SuccessResponse, UnauthorizedResponse } from "@/shared/utils/api"
import { ExchangeRate, Currency } from "@repo/db"
import getExchangeRates from "@/features/exchange-rates/api/get-exchange-rates"
import setExchangeRate from "@/features/exchange-rates/api/set-exchange-rate"

/**
 * GET /api/exchange-rates
 * Get all exchange rates for authenticated user
 * 
 * Query parameters:
 * - fromCurrency (optional): Filter by source currency
 * - toCurrency (optional): Filter by target currency
 */
export async function GET(request: NextRequest): Promise<NextResponse<ApiResponse<ExchangeRate[]>>> {
    const { authenticated, userId } = await verifyAuth()
    if (!authenticated) return UnauthorizedResponse(userId)

    try {
        const { searchParams } = new URL(request.url)
        const fromCurrency = (searchParams.get('fromCurrency') || undefined) as Currency | undefined
        const toCurrency = (searchParams.get('toCurrency') || undefined) as Currency | undefined

        const rates = await getExchangeRates(
            userId,
            fromCurrency,
            toCurrency
        )

        return SuccessResponse(rates)
    } catch (error) {
        console.error('Error getting exchange rates:', error)
        return BadRequestResponse<ExchangeRate[]>(
            error instanceof Error ? error.message : 'Failed to get exchange rates'
        )
    }
}

/**
 * PUT /api/exchange-rates
 * Set or update an exchange rate
 * 
 * Body:
 * - fromCurrency: Source currency
 * - toCurrency: Target currency
 * - rate: Exchange rate (positive number)
 */
export async function PUT(request: NextRequest): Promise<NextResponse<ApiResponse<ExchangeRate>>> {
    const { authenticated, userId } = await verifyAuth()
    if (!authenticated) return UnauthorizedResponse(userId)

    const jsonInput = await getJsonInput(request)
    if (!jsonInput) return BadRequestResponse(jsonInput)

    try {
        const rate = await setExchangeRate(userId, jsonInput)
        return SuccessResponse(rate)
    } catch (error) {
        console.error('Error setting exchange rate:', error)
        return BadRequestResponse<ExchangeRate>(
            error instanceof Error ? error.message : 'Failed to set exchange rate'
        )
    }
}

