import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { verifyToken } from './lib/jwt'

/**
 * Authentication middleware for Next.js
 * Validates JWT token from cookies and protects routes
 * 
 * Usage in app middleware.ts:
 * ```typescript
 * import { authMiddleware } from '@repo/auth'
 * export const middleware = authMiddleware
 * export const config = { matcher: ['/dashboard/:path*', '/api/:path*'] }
 * ```
 */
export async function authMiddleware(request: NextRequest): Promise<NextResponse> {
  const token = request.cookies.get('auth_token')?.value

  // Allow access to login and public routes
  if (
    request.nextUrl.pathname.startsWith('/login') ||
    request.nextUrl.pathname.startsWith('/register') ||
    request.nextUrl.pathname.startsWith('/_next') ||
    request.nextUrl.pathname.startsWith('/api/auth')
  ) {
    return NextResponse.next()
  }

  // Redirect to login if no token
  if (!token) {
    const loginUrl = getLoginUrl(request)
    return NextResponse.redirect(loginUrl)
  }

  try {
    // Verify token
    const payload = await verifyToken(token)

    // Add user info to headers for downstream consumption
    request.headers.set('x-user-id', payload.id)
    request.headers.set('x-user-email', payload.email)

    return NextResponse.next()
  } catch {
    // Invalid token - redirect to login
    const loginUrl = getLoginUrl(request)
    return NextResponse.redirect(loginUrl)
  }
}

function getLoginUrl(request: NextRequest): URL {
  const loginUrl = new URL('/login', request.url)
  loginUrl.searchParams.set('redirect', request.nextUrl.pathname)
  return loginUrl
}