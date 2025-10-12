/**
 * API Middleware Utilities
 * Shared authentication and error handling for API routes
 */
import { NextRequest } from 'next/server'
import { verifyToken } from './lib/jwt'
import { COOKIE_NAME } from './lib/cookies'

type VerifyAuthResponse = {
  authenticated: true
  userId: string
} | {
  authenticated: false
  userId: null
}

export async function verifyAuth(request: NextRequest): Promise<VerifyAuthResponse> {
  const token = request.cookies.get(COOKIE_NAME)?.value
  if (!token) {
    return { authenticated: false, userId: null }
  }
  try {
    const payload = await verifyToken(token)
    return { authenticated: true, userId: payload.id }
  } catch {
    return { authenticated: false, userId: null }
  }
}