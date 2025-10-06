/**
 * Shared API route handlers for authentication
 * Reusable across all Next.js apps
 */
import { NextRequest, NextResponse } from 'next/server'
import { generateToken, setAuthCookie, clearAuthCookie } from './index'

/**
 * Login API handler
 * Usage in app route: export { loginHandler as POST } from '@repo/auth/api-handlers'
 */
export async function loginHandler(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    // TODO: Replace with actual user authentication
    // This is a placeholder implementation
    if (email && password) {
      // In production, verify credentials against database
      const user = {
        id: '1',
        email,
        name: 'Demo User',
      }

      // Generate JWT token
      const token = await generateToken(user)

      // Set auth cookie
      await setAuthCookie(token)

      return NextResponse.json({ success: true, user })
    }

    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * Logout API handler
 * Usage in app route: export { logoutHandler as POST } from '@repo/auth/api-handlers'
 */
export async function logoutHandler() {
  try {
    await clearAuthCookie()
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Logout error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

