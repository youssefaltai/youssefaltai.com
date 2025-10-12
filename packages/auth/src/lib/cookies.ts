import { cookies } from 'next/headers'

export const COOKIE_NAME = 'auth_token'

/**
 * Get cookie domain based on environment
 * Production: .youssefaltai.com (shares across all subdomains)
 * Development: undefined (uses current domain)
 */
function getCookieDomain(): string | undefined {
  if (process.env.NODE_ENV === 'production') {
    return '.youssefaltai.com'
  }
  return undefined
}

/**
 * Cookie configuration
 * httpOnly: Prevents XSS attacks
 * secure: Only sent over HTTPS in production
 * sameSite: CSRF protection
 * domain: Shares cookie across all subdomains in production
 * path: Available across all routes
 */
const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  domain: getCookieDomain(),
  path: '/',
  maxAge: 60 * 60 * 24 * 7, // 7 days
}

/**
 * Set authentication cookie
 */
export async function setAuthCookie(token: string): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.set(COOKIE_NAME, token, cookieOptions)
}

/**
 * Clear authentication cookie (logout)
 */
export async function clearAuthCookie(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.delete(COOKIE_NAME)
}

/**
 * Get authentication token from cookie
 */
export async function getAuthCookie(): Promise<string | undefined> {
  const cookieStore = await cookies()
  return cookieStore.get(COOKIE_NAME)?.value
}

