import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const SESSION_COOKIE = 'passkey_session'

export async function authMiddleware(request: NextRequest): Promise<NextResponse> {
  const sessionId = request.cookies.get(SESSION_COOKIE)?.value

  // Skip auth for public routes
  if (
    request.nextUrl.pathname.startsWith('/login') ||
    request.nextUrl.pathname.startsWith('/verify-device') ||
    request.nextUrl.pathname.startsWith('/register') ||
    request.nextUrl.pathname.startsWith('/_next') ||
    request.nextUrl.pathname.startsWith('/api/') ||
    request.nextUrl.pathname.includes('/icon-') ||
    request.nextUrl.pathname.includes('/apple-icon') ||
    request.nextUrl.pathname === '/manifest.webmanifest'
  ) {
    return NextResponse.next()
  }

  // No session cookie - redirect to login
  if (!sessionId) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('redirect', request.nextUrl.pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Cookie exists - let it through
  // Actual validation happens in API routes via verifyAuth()
  return NextResponse.next()
}