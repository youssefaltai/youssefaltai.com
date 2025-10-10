/**
 * API Middleware Utilities
 * Shared authentication and error handling for API routes
 */
import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from './lib/jwt'

/**
 * Authenticated API handler wrapper
 * Automatically verifies JWT token and provides userId to handler
 * 
 * @example
 * ```tsx
 * export const GET = withAuth(async (request, userId) => {
 *   const data = await getData(userId)
 *   return NextResponse.json({ data })
 * })
 * ```
 */
export function withAuth<T = any>(
  handler: (request: NextRequest, userId: string, context?: T) => Promise<NextResponse>
) {
  return async (request: NextRequest, context?: T) => {
    try {
      // Verify authentication
      const token = request.cookies.get('auth_token')?.value
      if (!token) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
      }

      const payload = await verifyToken(token)
      if (!payload?.id) {
        return NextResponse.json({ message: 'Invalid token' }, { status: 401 })
      }

      // Call the handler with userId
      return await handler(request, payload.id, context)
    } catch (error) {
      console.error('Authentication error:', error)
      return NextResponse.json({ message: 'Authentication failed' }, { status: 401 })
    }
  }
}

/**
 * Standard error response helper
 */
export function errorResponse(message: string, status: number = 500, error?: unknown) {
  return NextResponse.json(
    { message, error: error ? String(error) : undefined },
    { status }
  )
}

/**
 * Validation error response helper
 */
export function validationError(errors: unknown) {
  return NextResponse.json(
    { message: 'Validation error', errors },
    { status: 400 }
  )
}

