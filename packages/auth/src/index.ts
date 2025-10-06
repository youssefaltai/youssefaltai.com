// Shared authentication utilities and middleware
export { generateToken, verifyToken } from './lib/jwt'
export { authMiddleware } from './middleware'
export { setAuthCookie, clearAuthCookie, getAuthCookie } from './lib/cookies'
export { loginHandler, logoutHandler } from './api-handlers'
export type { JWTPayload, AuthUser } from './types'

