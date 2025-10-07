// Shared authentication utilities and middleware
// These exports are safe for Edge Runtime (middleware)
export { generateToken, verifyToken } from './lib/jwt'
export { authMiddleware } from './middleware'
export { setAuthCookie, clearAuthCookie, getAuthCookie } from './lib/cookies'
export type { JWTPayload, AuthUser } from './types'

// Re-export API handlers separately to avoid importing Prisma in middleware
// Use: import { loginHandler } from '@repo/auth/api-handlers'
export { hashPassword, verifyPassword } from './lib/password'

