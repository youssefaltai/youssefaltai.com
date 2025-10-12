import { SignJWT, jwtVerify } from 'jose'
import type { AuthUser, JWTPayload } from '@repo/types'

/**
 * Get JWT secret from environment
 * Shared across all apps for cross-domain authentication
 */
function getSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET
  if (!secret) {
    throw new Error('JWT_SECRET environment variable is not set')
  }
  return new TextEncoder().encode(secret)
}

/**
 * Generate a JWT token for a user
 * @param user - User data to encode in the token
 * @param expiresIn - Token expiration time (default: 7 days)
 */
export async function generateToken(
  user: AuthUser,
  expiresIn = '7d'
): Promise<string> {
  const secret = getSecret()

  return new SignJWT({ ...user })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(expiresIn)
    .sign(secret)
}

/**
 * Verify and decode a JWT token
 * @param token - JWT token to verify
 * @returns Decoded payload if valid
 * @throws Error if token is invalid or expired
 */
export async function verifyToken(token: string): Promise<JWTPayload | never> {
  const secret = getSecret()

  try {
    const { payload } = await jwtVerify(token, secret)
    // Validate required fields exist
    if (!payload.id || !payload.email) {
      throw new Error('Invalid token payload')
    }
    return payload as unknown as JWTPayload
  } catch (error) {
    throw new Error('Invalid or expired token')
  }
}

