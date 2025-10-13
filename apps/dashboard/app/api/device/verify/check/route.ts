import { NextResponse } from 'next/server'
import { prisma } from '@repo/db'

export async function POST(request: Request) {
  try {
    const { token } = await request.json()
    
    const verification = await prisma.deviceVerification.findUnique({
      where: { token },
    })
    
    if (!verification) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 400 })
    }
    
    // Delete expired tokens
    if (verification.expiresAt < new Date()) {
      await prisma.deviceVerification.delete({ where: { token } })
      return NextResponse.json({ error: 'Token expired' }, { status: 400 })
    }
    
    // Delete already used tokens
    if (verification.verified) {
      await prisma.deviceVerification.delete({ where: { token } })
      return NextResponse.json({ error: 'Token already used' }, { status: 400 })
    }
    
    // Mark as verified
    await prisma.deviceVerification.update({
      where: { token },
      data: { verified: true },
    })
    
    // Schedule cleanup after 5 minutes (used tokens don't need to stay)
    setTimeout(async () => {
      try {
        await prisma.deviceVerification.deleteMany({
          where: {
            OR: [
              { expiresAt: { lt: new Date() } },
              { verified: true, createdAt: { lt: new Date(Date.now() - 5 * 60 * 1000) } }
            ]
          }
        })
      } catch (err) {
        console.error('Token cleanup error:', err)
      }
    }, 5 * 60 * 1000)
    
    return NextResponse.json({ userId: verification.userId, verified: true })
  } catch (error) {
    return NextResponse.json({ error: 'Verification failed' }, { status: 500 })
  }
}

