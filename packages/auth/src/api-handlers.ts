/**
 * Shared API route handlers for authentication
 * Reusable across all Next.js apps
 */
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@repo/db'
import { generateToken, setAuthCookie, clearAuthCookie } from './index'
import { verifyPassword, hashPassword } from './lib/password'

/**
 * Login API handler
 * Usage in app route: export { loginHandler as POST } from '@repo/auth/api-handlers'
 */
export async function loginHandler(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password required' }, { status: 400 })
    }

    // Find user in database
    const user = await prisma.user.findUnique({
      where: { email },
    })

    if (!user) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    }

    // Verify password
    const isValid = await verifyPassword(password, user.password)

    if (!isValid) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    }

    // Generate JWT token
    const token = await generateToken({
      id: user.id,
      email: user.email,
      name: user.name || undefined,
    })

    // Set auth cookie
    await setAuthCookie(token)

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    })
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

