'use client'

import { Suspense, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useRegisterPasskey } from 'next-passkey-webauthn/client'
import { Button, Card } from '@repo/ui'

const endpoints = {
  registerStart: '/api/passkey/register/start',
  registerFinish: '/api/passkey/register/finish',
  authenticateStart: '/api/passkey/authenticate/start',
  authenticateFinish: '/api/passkey/authenticate/finish',
  deletePasskey: '/api/passkey/delete',
  listPasskeys: '/api/passkey/list',
}

function VerifyDeviceContent() {
  const [status, setStatus] = useState<'loading' | 'verified' | 'error'>('loading')
  const [error, setError] = useState('')
  const [userId, setUserId] = useState<string | null>(null)
  const searchParams = useSearchParams()
  const router = useRouter()
  
  const { register, loading: registerLoading } = useRegisterPasskey({ endpoints })

  useEffect(() => {
    const verifyToken = async () => {
      const token = searchParams.get('token')
      if (!token) {
        setStatus('error')
        setError('Invalid verification link')
        return
      }

      try {
        const res = await fetch('/api/device/verify/check', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token }),
        })

        if (!res.ok) {
          const data = await res.json()
          throw new Error(data.error || 'Verification failed')
        }

        const data = await res.json()
        setUserId(data.userId)
        setStatus('verified')
      } catch (err) {
        setStatus('error')
        setError(err instanceof Error ? err.message : 'Verification failed')
      }
    }
    
    verifyToken()
  }, [searchParams])

  const handleRegisterDevice = async () => {
    if (!userId) return

    try {
      const result = await register(userId, {
        userName: searchParams.get('email') || undefined,
      })

      if (result.verified) {
        router.push('/')
      } else {
        setError('Failed to register device')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed')
    }
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-ios-gray-6 px-4">
        <Card padding="lg">
          <p className="text-ios-body text-ios-gray-1">Verifying...</p>
        </Card>
      </div>
    )
  }

  if (status === 'error') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-ios-gray-6 px-4">
        <div className="max-w-md w-full">
          <Card padding="lg">
            <h2 className="text-ios-title-3 font-bold text-ios-label-primary mb-4">
              Verification Failed
            </h2>
            <p className="text-ios-body text-ios-red mb-4">{error}</p>
            <Button onClick={() => router.push('/login')} className="w-full">
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
        <Card padding="lg">
          <h2 className="text-ios-title-3 font-bold text-ios-label-primary mb-4">
            Register This Device
          </h2>
          <p className="text-ios-body text-ios-gray-1 mb-6">
            Your email has been verified. Now register this device with biometrics.
          </p>
          
          {error && (
            <div className="bg-ios-red/10 border border-ios-red text-ios-red px-4 py-3 rounded-ios text-ios-callout mb-4">
              {error}
            </div>
          )}
          
          <Button 
            onClick={handleRegisterDevice} 
            disabled={registerLoading}
            className="w-full"
          >
            {registerLoading ? '...' : '🔒 Register with Face ID / Touch ID'}
          </Button>
        </Card>
      </div>
    </div>
  )
}

export default function VerifyDevicePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-ios-gray-6 px-4">
        <Card padding="lg">
          <p className="text-ios-body text-ios-gray-1">Loading...</p>
        </Card>
      </div>
    }>
      <VerifyDeviceContent />
    </Suspense>
  )
}
