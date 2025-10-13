import { NextResponse } from 'next/server'
import { startAuthentication } from '@repo/auth/passkey-handlers'

export async function POST(request: Request) {
  try {
    const { userId } = await request.json()
    const result = await startAuthentication(userId, request)
    return NextResponse.json(result)
  } catch (error) {
    console.error('Error in startAuthentication:', error)
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Authentication failed',
      code: (error as any)?.code
    }, { status: 400 })
  }
}
