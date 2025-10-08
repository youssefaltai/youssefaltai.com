'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { startRegistration, startAuthentication } from '@simplewebauthn/browser'
import { Button } from './Button'

interface BiometricLoginFormProps {
  appName: string
}

export function BiometricLoginForm({ appName }: BiometricLoginFormProps) {
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [isNewUser, setIsNewUser] = useState(false)
  const [mounted, setMounted] = useState(false)
  const router = useRouter()

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  // Check if WebAuthn is supported (only on client)
  const isWebAuthnSupported = mounted && typeof globalThis !== 'undefined' &&
    'PublicKeyCredential' in globalThis

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      // Step 1: Get authentication options
      const optionsRes = await fetch('/api/auth/webauthn/login/options', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      if (!optionsRes.ok) {
        if (optionsRes.status === 404) {
          // User doesn't exist, switch to registration mode
          setIsNewUser(true)
          setError('No account found. Please register with Face ID / Touch ID.')
          setLoading(false)
          return
        }
        throw new Error('Failed to get authentication options')
      }

      const { options, userId } = await optionsRes.json() as { options: any; userId: string }

      // Step 2: Start biometric authentication
      const credential = await startAuthentication(options)

      // Step 3: Verify authentication
      const verifyRes = await fetch('/api/auth/webauthn/login/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, credential }),
      })

      if (!verifyRes.ok) {
        throw new Error('Authentication failed')
      }

      // Success - redirect
      router.push('/')
    } catch (err: any) {
      console.error('Login error:', err)
      setError(err.message || 'Authentication failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      // Step 1: Get registration options
      const optionsRes = await fetch('/api/auth/webauthn/register/options', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name }),
      })

      if (!optionsRes.ok) {
        throw new Error('Failed to get registration options')
      }

      const { options, userId } = await optionsRes.json() as { options: any; userId: string }

      // Step 2: Start biometric registration
      const credential = await startRegistration(options)

      // Step 3: Verify registration
      const verifyRes = await fetch('/api/auth/webauthn/register/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          credential,
          deviceName: 'Face ID / Touch ID',
        }),
      })

      if (!verifyRes.ok) {
        throw new Error('Registration failed')
      }

      // Success - redirect
      router.push('/')
    } catch (err: any) {
      console.error('Registration error:', err)
      setError(err.message || 'Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (!isWebAuthnSupported) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow">
          <div>
            <h2 className="text-3xl font-bold text-center">{appName}</h2>
            <p className="mt-2 text-center text-red-600">
              Your browser doesn't support Face ID / Touch ID authentication.
              Please use a modern browser like Chrome, Safari, or Edge.
            </p>
          </div>
        </div>
      </div>
    )
  }

  // Prevent hydration mismatch - don't render until mounted
  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow">
          <div>
            <h2 className="text-3xl font-bold text-center">{appName}</h2>
            <p className="mt-2 text-center text-gray-600">Loading...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow">
        <div>
          <h2 className="text-3xl font-bold text-center">{appName}</h2>
          <p className="mt-2 text-center text-gray-600">
            {isNewUser ? 'Register with Face ID / Touch ID' : 'Sign in with Face ID / Touch ID'}
          </p>
        </div>

        <form className="space-y-6" onSubmit={isNewUser ? handleRegister : handleLogin}>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              value={email}
              onChange={(e) => setEmail((e.target as HTMLInputElement).value)}
              disabled={loading}
            />
          </div>

          {isNewUser && (
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Name (optional)
              </label>
              <input
                id="name"
                type="text"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                value={name}
                onChange={(e) => setName((e.target as HTMLInputElement).value)}
                disabled={loading}
              />
            </div>
          )}

          {error && <p className="text-red-500 text-sm text-center">{error}</p>}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? '...' : isNewUser ? '🔒 Register with Face ID / Touch ID' : '🔒 Sign in with Face ID / Touch ID'}
          </Button>

          {!isNewUser && (
            <button
              type="button"
              className="w-full text-sm text-blue-600 hover:underline"
              onClick={() => setIsNewUser(true)}
            >
              New user? Register with Face ID / Touch ID
            </button>
          )}

          {isNewUser && (
            <button
              type="button"
              className="w-full text-sm text-blue-600 hover:underline"
              onClick={() => {
                setIsNewUser(false)
                setError(null)
              }}
            >
              Already have an account? Sign in
            </button>
          )}
        </form>

        <p className="text-xs text-center text-gray-500 mt-4">
          This app uses your device's Face ID or Touch ID for secure, password-free authentication.
        </p>
      </div>
    </div>
  )
}

