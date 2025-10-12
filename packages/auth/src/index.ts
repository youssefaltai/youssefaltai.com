// Shared authentication utilities and middleware
// These exports are safe for Edge Runtime (middleware)
export { generateToken, verifyToken } from './lib/jwt'
export { authMiddleware } from './middleware'
export { setAuthCookie, clearAuthCookie, getAuthCookie, COOKIE_NAME } from './lib/cookies'

// NOTE: verifyAuth and webauthn-handlers are NOT exported here because they import Prisma
// which cannot run in Edge Runtime (middleware). Import them directly in API routes:
// import { verifyAuth } from '@repo/auth/verify-auth'
// import { registrationOptionsHandler } from '@repo/auth/webauthn-handlers'

// Re-export types from @repo/types for convenience
export type { JWTPayload, AuthUser } from '@repo/types'