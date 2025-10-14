'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthenticatePasskey } from 'next-passkey-webauthn/client'
import { Container, Paper, TextInput, Button, Title, Text, Alert, Stack } from '@mantine/core'

const endpoints = {
  registerStart: '/api/passkey/register/start',
  registerFinish: '/api/passkey/register/finish',
  authenticateStart: '/api/passkey/authenticate/start',
  authenticateFinish: '/api/passkey/authenticate/finish',
  deletePasskey: '/api/passkey/delete',
  listPasskeys: '/api/passkey/list',
}

export default function LoginPage() {
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
        const startRes = await fetch('/api/passkey/authenticate/start', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId }),
        })

        if (!startRes.ok) {
          const errorData = await startRes.json()
          
          if (errorData?.code !== 'CREDENTIAL_NOT_FOUND') {
            setError(errorData?.error || 'Authentication failed. Please try again.')
            return
          }
        } else {
          const result = await authenticate(userId)
          if (result.verified) {
            router.push('/')
            return
          }
        }
      } catch (err: unknown) {
        const errorData = err as any
        setError(errorData?.error || 'Authentication failed. Please try again.')
        return
      }

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
      <Container size="xs" py="xl" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center' }}>
        <Stack gap="md" style={{ width: '100%', textAlign: 'center' }}>
          <Title order={1}>Finance</Title>
          <Text c="red">WebAuthn not supported. Please use a modern browser.</Text>
        </Stack>
      </Container>
    )
  }

  if (verificationSent) {
    return (
      <Container size="xs" py="xl" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center' }}>
        <Stack gap="xl" style={{ width: '100%' }}>
          <div style={{ textAlign: 'center' }}>
            <Title order={1}>Finance</Title>
          </div>

          <Paper p="xl" withBorder>
            <Stack gap="md">
              <Title order={3}>Check Your Email</Title>
              <Text>
                We&apos;ve sent a verification link to <strong>{email}</strong>
              </Text>
              <Text size="sm" c="dimmed">
                Click the link in the email to register this device with biometrics.
              </Text>
              <Button
                onClick={() => {
                  setVerificationSent(false)
                  setError('')
                }}
                variant="default"
                fullWidth
              >
                Back to Login
              </Button>
            </Stack>
          </Paper>
        </Stack>
      </Container>
    )
  }

  return (
    <Container size="xs" py="xl" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center' }}>
      <Stack gap="xl" style={{ width: '100%' }}>
        <div style={{ textAlign: 'center' }}>
          <Title order={1}>Finance</Title>
          <Text c="dimmed" mt="sm">Sign in with biometrics</Text>
        </div>

        <Paper p="xl" withBorder>
          <form onSubmit={handleSubmit}>
            <Stack gap="md">
              <TextInput
                label="Email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={authLoading}
              />

              {error && (
                <Alert color="red" title="Error">
                  {error}
                </Alert>
              )}

              <Button type="submit" fullWidth loading={authLoading}>
                🔒 Sign in
              </Button>
            </Stack>
          </form>
        </Paper>

        <Text size="xs" c="dimmed" ta="center">
          Secure, password-free authentication.
        </Text>
      </Stack>
    </Container>
  )
}
