import { NextResponse } from 'next/server'
import { prisma } from '@repo/db'
import { sendDeviceVerificationEmail } from '@repo/auth/lib/email'

export async function POST(request: Request) {
  try {
    const { userId, email } = await request.json()
    
    const token = crypto.randomUUID()
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000)
    
    await prisma.deviceVerification.create({
      data: { userId, email, token, expiresAt },
    })
    
    try {
      await sendDeviceVerificationEmail(email, token, 'Fitness')
    } catch (emailError) {
      console.error('Failed to send verification email:', emailError)
      return NextResponse.json({ 
        error: 'Email service unavailable. Please contact support.' 
      }, { status: 503 })
    }
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Verification send error:', error)
    return NextResponse.json({ error: 'Failed to send email' }, { status: 500 })
  }
}

