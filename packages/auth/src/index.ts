// Shared authentication utilities and middleware
// These exports are safe for Edge Runtime (middleware)
export { generateToken, verifyToken } from './lib/jwt'
export { authMiddleware } from './middleware'
export { setAuthCookie, clearAuthCookie, getAuthCookie } from './lib/cookies'

// Re-export types from @repo/types for convenience
export type { JWTPayload, AuthUser } from '@repo/types'