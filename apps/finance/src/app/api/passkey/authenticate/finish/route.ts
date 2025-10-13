import { NextResponse } from 'next/server'
import { finishAuthentication } from '@repo/auth/passkey-handlers'

export async function POST(request: Request) {
  try {
    const { userId, credential } = await request.json()
    const result = await finishAuthentication(userId, credential)
    return NextResponse.json(result)
  } catch (error) {
    return NextResponse.json({ error: 'Authentication failed' }, { status: 400 })
  }
}
