/**
 * WebAuthn (Face ID / Touch ID) API handlers
 * Biometric authentication using Web Authentication API
 */
import { NextRequest, NextResponse } from 'next/server'
import {
  generateRegistrationOptions,
  verifyRegistrationResponse,
  generateAuthenticationOptions,
  verifyAuthenticationResponse,
} from '@simplewebauthn/server'
import type {
  RegistrationResponseJSON,
  AuthenticationResponseJSON,
} from '@simplewebauthn/types'
import { prisma } from '@repo/db'
import { generateToken } from './lib/jwt'
import { setAuthCookie } from './lib/cookies'
import { storeChallenge, consumeChallenge } from './lib/challenge-store'

// WebAuthn configuration
const RP_NAME = 'Youssef Altai'

// Get RP ID from request origin
function getRPID(origin: string): string {
  const url = new URL(origin)
  // For production: use root domain (youssefaltai.com)
  // For localhost: use 'localhost'
  return url.hostname === 'localhost' ? 'localhost' : 'youssefaltai.com'
}

// Get origin from request
function getOrigin(request: NextRequest): string {
  const origin = request.headers.get('origin')
  if (!origin) {
    throw new Error('Origin header is required')
  }
  return origin
}

// Helper to convert Buffer to base64url
function bufferToBase64url(buffer: Buffer): string {
  return Buffer.from(buffer).toString('base64url')
}

/**
 * Start registration - Generate options for Face ID/Touch ID setup
 */
export async function registrationOptionsHandler(request: NextRequest) {
  try {
    const { email, name } = await request.json() as { email: string; name?: string }

    if (!email) {
      return NextResponse.json({ error: 'Email required' }, { status: 400 })
    }

    const origin = getOrigin(request)
    const rpID = getRPID(origin)

    // Find or create user
    let user = await prisma.user.findUnique({ where: { email } })
    
    if (!user) {
      user = await prisma.user.create({
        data: { email, name },
      })
    }

    // Get user's existing credentials
    const userCredentials = await prisma.credential.findMany({
      where: { userId: user.id },
      select: {
        credentialId: true,
        transports: true,
      },
    })

    const options = await generateRegistrationOptions({
      rpName: RP_NAME,
      rpID: rpID,
      userName: email,
      userDisplayName: name || email,
      attestationType: 'none',
      excludeCredentials: userCredentials.map((cred) => ({
        id: bufferToBase64url(cred.credentialId as Buffer),
        transports: cred.transports as any[],
      })),
      authenticatorSelection: {
        residentKey: 'preferred',
        userVerification: 'preferred',
        authenticatorAttachment: 'platform', // Prefer built-in Face ID/Touch ID
      },
    })

    // Store challenge in Redis with automatic expiration
    await storeChallenge(user.id, options.challenge)

    return NextResponse.json({ options, userId: user.id })
  } catch (error: any) {
    console.error('Registration options error:', error)
    console.error('Error stack:', error?.stack)
    return NextResponse.json({ 
      error: 'Internal server error',
      message: error?.message,
      stack: error?.stack
    }, { status: 500 })
  }
}

/**
 * Verify registration - Save Face ID/Touch ID credential
 */
export async function registrationVerificationHandler(request: NextRequest) {
  try {
    const { userId, credential, deviceName } = await request.json() as {
      userId: string
      credential: RegistrationResponseJSON
      deviceName?: string
    }

    const origin = getOrigin(request)
    const rpID = getRPID(origin)

    const user = await prisma.user.findUnique({ where: { id: userId } })
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Get challenge from Redis (single-use)
    const challenge = await consumeChallenge(userId)
    if (!challenge) {
      return NextResponse.json({ error: 'Challenge expired or not found' }, { status: 400 })
    }

    const verification = await verifyRegistrationResponse({
      response: credential,
      expectedChallenge: challenge,
      expectedOrigin: origin,
      expectedRPID: rpID,
    })

    if (!verification.verified || !verification.registrationInfo) {
      return NextResponse.json({ error: 'Verification failed' }, { status: 400 })
    }

    const { credential: webAuthnCredential } = verification.registrationInfo

    // Save credential to database
    await prisma.credential.create({
      data: {
        userId: user.id,
        credentialId: Buffer.from(webAuthnCredential.id),
        publicKey: Buffer.from(webAuthnCredential.publicKey),
        counter: BigInt(webAuthnCredential.counter),
        transports: credential.response.transports || [],
        deviceName: deviceName || 'Biometric Device',
      },
    })

    // Generate JWT and set cookie
    const token = await generateToken({
      id: user.id,
      email: user.email,
      name: user.name || undefined,
    })
    await setAuthCookie(token)

    return NextResponse.json({
      success: true,
      verified: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    })
  } catch (error: any) {
    console.error('Registration verification error:', error)
    console.error('Error stack:', error?.stack)
    console.error('Error message:', error?.message)
    return NextResponse.json({ 
      error: 'Registration failed',
      message: error?.message,
      stack: error?.stack?.split('\n').slice(0, 5).join('\n')
    }, { status: 500 })
  }
}

/**
 * Start authentication - Generate options for Face ID/Touch ID login
 */
export async function authenticationOptionsHandler(request: NextRequest) {
  try {
    const { email } = await request.json() as { email: string }

    if (!email) {
      return NextResponse.json({ error: 'Email required' }, { status: 400 })
    }

    const origin = getOrigin(request)
    const rpID = getRPID(origin)

    const user = await prisma.user.findUnique({
      where: { email },
      include: { credentials: true },
    })

    if (!user || user.credentials.length === 0) {
      return NextResponse.json({ error: 'No credentials found' }, { status: 404 })
    }

    const options = await generateAuthenticationOptions({
      rpID: rpID,
      allowCredentials: user.credentials.map((cred) => ({
        id: bufferToBase64url(cred.credentialId as Buffer),
        // Force 'internal' only (platform authenticator - no QR codes)
        // Even if credential has 'hybrid', we only want Face ID/Touch ID
        transports: ['internal'] as any[],
      })),
      userVerification: 'preferred',  // Prefer biometric but don't force
    })

    // Store challenge in Redis with automatic expiration
    await storeChallenge(user.id, options.challenge)

    return NextResponse.json({ options, userId: user.id })
  } catch (error: any) {
    console.error('Authentication options error:', error)
    console.error('Error stack:', error?.stack)
    return NextResponse.json({ 
      error: 'Internal server error',
      message: error?.message,
      stack: error?.stack
    }, { status: 500 })
  }
}

/**
 * Verify authentication - Verify Face ID/Touch ID and log in
 */
export async function authenticationVerificationHandler(request: NextRequest) {
  try {
    const { userId, credential } = await request.json() as {
      userId: string
      credential: AuthenticationResponseJSON
    }

    const origin = getOrigin(request)
    const rpID = getRPID(origin)

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { credentials: true },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Get challenge from Redis (single-use)
    const challenge = await consumeChallenge(userId)
    if (!challenge) {
      return NextResponse.json({ error: 'Challenge expired or not found' }, { status: 400 })
    }

    // Find matching credential
    const dbCredential = user.credentials.find(
      (cred) => Buffer.from(cred.credentialId).toString('base64url') === credential.id
    )

    if (!dbCredential) {
      return NextResponse.json({ error: 'Credential not found' }, { status: 404 })
    }

    const verification = await verifyAuthenticationResponse({
      response: credential,
      expectedChallenge: challenge,
      expectedOrigin: origin,
      expectedRPID: rpID,
      credential: {
        id: bufferToBase64url(dbCredential.credentialId as Buffer),
        publicKey: new Uint8Array(dbCredential.publicKey),
        counter: Number(dbCredential.counter),
      },
    })

    if (!verification.verified) {
      return NextResponse.json({ error: 'Verification failed' }, { status: 400 })
    }

    // Update credential counter and last used
    await prisma.credential.update({
      where: { id: dbCredential.id },
      data: {
        counter: BigInt(verification.authenticationInfo.newCounter),
        lastUsedAt: new Date(),
      },
    })

    // Generate JWT and set cookie
    const token = await generateToken({
      id: user.id,
      email: user.email,
      name: user.name || undefined,
    })
    await setAuthCookie(token)

    return NextResponse.json({
      success: true,
      verified: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    })
  } catch (error: any) {
    console.error('Authentication verification error:', error)
    console.error('Error stack:', error?.stack)
    return NextResponse.json({ 
      error: 'Authentication failed',
      message: error?.message,
      stack: error?.stack?.split('\n').slice(0, 5).join('\n')
    }, { status: 500 })
  }
}

