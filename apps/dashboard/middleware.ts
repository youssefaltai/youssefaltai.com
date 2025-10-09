/**
 * Dashboard App Middleware
 * Uses shared authentication from @repo/auth
 */
import { authMiddleware } from '@repo/auth'

export const middleware = authMiddleware

// Note: matcher must be inline for Next.js static analysis
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|manifest.webmanifest|icon-.*\\.png|apple-icon-.*\\.png|login|register|api/auth).*)',
  ],
}

