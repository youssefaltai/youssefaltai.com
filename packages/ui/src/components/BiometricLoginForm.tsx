'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthenticatePasskey } from 'next-passkey-webauthn/client'
import { Button } from './Button'
import { Input } from './Input'
import { Card } from './Card'

interface BiometricLoginFormProps {
  appName: string
}

const endpoints = {
  registerStart: '/api/passkey/register/start',
  registerFinish: '/api/passkey/register/finish',
  authenticateStart: '/api/passkey/authenticate/start',
  authenticateFinish: '/api/passkey/authenticate/finish',
  deletePasskey: '/api/passkey/delete',
  listPasskeys: '/api/passkey/list',
}

export function BiometricLoginForm({ appName }: BiometricLoginFormProps) {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [verificationSent, setVerificationSent] = useState(false)
  const [mounted, setMounted] = useState(false)
  const router = useRouter()

  const { authenticate, loading: authLoading, error: authError } = useAuthenticatePasskey({ endpoints })

  useEffect(() => {
    setMounted(true)
  }, [])

  const isSupported = mounted && 'PublicKeyCredential' in globalThis

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    try {
      const findRes = await fetch('/api/user/find', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      if (!findRes.ok) {
        setError('User not found. Contact administrator.')
        return
      }

      const { userId } = await findRes.json()

      try {
        // Call start authentication API directly to get proper error codes
        const startRes = await fetch('/api/passkey/authenticate/start', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId }),
        })

        if (!startRes.ok) {
          const errorData = await startRes.json()
          
          // Check for specific error codes
          if (errorData?.code === 'CREDENTIAL_NOT_FOUND') {
            // No passkey on this device - send email verification
          } else {
            setError(errorData?.error || 'Authentication failed. Please try again.')
            return
          }
        } else {
          // Start was successful, now call the client library authenticate
          const result = await authenticate(userId)
          if (result.verified) {
            router.push('/')
            return
          }
        }
      } catch (err: unknown) {
        // Handle any other errors from the authenticate call
        const errorData = err as any
        setError(errorData?.error || 'Authentication failed. Please try again.')
        return
      }

      // Only reach here if no passkey exists
      const sendRes = await fetch('/api/device/verify/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, email }),
      })

      if (!sendRes.ok) {
        const errorData = await sendRes.json()
        setError(errorData.error || 'Failed to send verification email. Please try again.')
        return
      }

      setVerificationSent(true)
    } catch (err) {
      setError(authError || (err instanceof Error ? err.message : 'Login failed'))
    }
  }

  if (!mounted) return null

  if (!isSupported) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-ios-gray-6 px-4">
        <div className="max-w-md w-full text-center">
          <h2 className="text-ios-title-1 font-bold text-ios-label-primary mb-2">{appName}</h2>
          <p className="text-ios-body text-ios-red">WebAuthn not supported. Please use a modern browser.</p>
        </div>
      </div>
    )
  }

  if (verificationSent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-ios-gray-6 px-4">
        <div className="max-w-md w-full">
          <div className="text-center mb-8">
            <h2 className="text-ios-title-1 font-bold text-ios-label-primary">{appName}</h2>
          </div>

          <Card padding='lg'>
            <h3 className="text-ios-title-3 font-bold text-ios-label-primary mb-4">
              Check Your Email
            </h3>
            <p className="text-ios-body text-ios-gray-1 mb-4">
              We've sent a verification link to <strong>{email}</strong>
            </p>
            <p className="text-ios-callout text-ios-gray-2 mb-6">
              Click the link in the email to register this device with biometrics.
            </p>
            <Button
              onClick={() => {
                setVerificationSent(false)
                setError('')
              }}
              variant="secondary"
              className="w-full"
            >
              Back to Login
            </Button>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-ios-gray-6 px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h2 className="text-ios-title-1 font-bold text-ios-label-primary">{appName}</h2>
          <p className="mt-2 text-ios-body text-ios-gray-1">Sign in with biometrics</p>
        </div>

        <Card padding='lg'>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <Input
              id="email"
              type="email"
              label="Email"
              required
              value={email}
              onChange={(e) => setEmail((e.target as HTMLInputElement).value)}
              disabled={authLoading}
            />

            {error && (
              <div className="bg-ios-red/10 border border-ios-red text-ios-red px-4 py-3 rounded-ios text-ios-callout">
                {error}
              </div>
            )}

            <Button type="submit" className="w-full" disabled={authLoading}>
              {authLoading ? '...' : '🔒 Sign in'}
            </Button>
          </form>
        </Card>

        <p className="text-ios-caption text-ios-gray-1 text-center mt-6">
          Secure, password-free authentication.
        </p>
      </div>
    </div>
  )
}
