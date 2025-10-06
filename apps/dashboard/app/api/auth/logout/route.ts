/**
 * Logout API Route
 * Clears authentication cookie
 */
import { NextResponse } from 'next/server'
import { clearAuthCookie } from '@repo/auth'

export async function POST() {
  try {
    await clearAuthCookie()
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Logout error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

