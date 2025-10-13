import { NextResponse } from 'next/server'
import { deletePasskey } from '@repo/auth/passkey-handlers'
import { requireMatchingUser } from '@repo/auth/lib/auth-helper'

export async function POST(request: Request) {
  try {
    const { userId, credentialId } = await request.json()
    
    // Verify user is authenticated and matches requested userId
    const authResult = await requireMatchingUser(userId)
    if (authResult !== true) {
      return authResult
    }
    
    await deletePasskey(userId, credentialId, request)
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Delete failed' }, { status: 400 })
  }
}
