/**
 * Login API Route
 * Example implementation using @repo/auth
 */
import { NextRequest, NextResponse } from 'next/server'
import { generateToken, setAuthCookie } from '@repo/auth'

export async function POST(request: NextRequest) {
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

