import { NextResponse } from 'next/server'
import { prisma } from '@repo/db'

export async function POST(request: Request) {
  try {
    const { email } = await request.json()
    const user = await prisma.user.findFirst({ 
      where: { 
        email,
        deletedAt: null
      } 
    })
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json({ userId: user.id })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to find user' }, { status: 500 })
  }
}

