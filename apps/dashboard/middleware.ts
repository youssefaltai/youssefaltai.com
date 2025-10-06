/**
 * Dashboard App Middleware
 * Uses shared authentication from @repo/auth
 */
import { authMiddleware } from '@repo/auth'

export const middleware = authMiddleware

// Protect all routes except public ones
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     * - login/register pages
     */
    '/((?!_next/static|_next/image|favicon.ico|login|register|api/auth).*)',
  ],
}

