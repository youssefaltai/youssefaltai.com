import { NextResponse } from 'next/server'
import { startRegistration } from '@repo/auth/passkey-handlers'

export async function POST(request: Request) {
  try {
    const { userId, userName, userDisplayName } = await request.json()
    const result = await startRegistration(userId, request, { userName, userDisplayName })
    return NextResponse.json(result)
  } catch (error) {
    return NextResponse.json({ error: 'Registration failed' }, { status: 400 })
  }
}
