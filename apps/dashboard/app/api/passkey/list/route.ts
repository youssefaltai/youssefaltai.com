import { NextResponse } from 'next/server'
import { listPasskeys } from '@repo/auth/passkey-handlers'
import { requireMatchingUser } from '@repo/auth/lib/auth-helper'

export async function POST(request: Request) {
  try {
    const { userId } = await request.json()
    
    // Verify user is authenticated and matches requested userId
    const authResult = await requireMatchingUser(userId)
    if (authResult !== true) {
      return authResult
    }
    
    const passkeys = await listPasskeys(userId, request)
    return NextResponse.json({ passkeys })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to list passkeys' }, { status: 400 })
  }
}
