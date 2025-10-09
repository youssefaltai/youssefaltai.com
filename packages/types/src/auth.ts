/**
 * Shared authentication types
 */

export interface AuthUser {
  id: string
  email: string
  name?: string
}

export interface JWTPayload extends AuthUser {
  iat: number
  exp: number
}

