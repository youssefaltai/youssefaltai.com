import { NextResponse } from 'next/server'
import { finishRegistration } from '@repo/auth/passkey-handlers'

export async function POST(request: Request) {
  try {
    const { userId, userName, userDisplayName, credential, deviceInfo, managementOptions } = await request.json()
    const result = await finishRegistration(userId, credential, request, {
      userName,
      userDisplayName,
      deviceInfo,
      managementOptions,
    })
    return NextResponse.json(result)
  } catch (error) {
    return NextResponse.json({ error: 'Registration failed' }, { status: 400 })
  }
}
