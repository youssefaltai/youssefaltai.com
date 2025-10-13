import { NextResponse } from 'next/server'
import { deleteSession } from '@repo/auth/lib/session-simple'

export async function POST() {
  await deleteSession()
  return NextResponse.json({ success: true })
}
