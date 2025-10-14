'use client'

import { Suspense, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useRegisterPasskey } from 'next-passkey-webauthn/client'
import { Button, Paper, Container, Title, Text, Alert, Stack } from '@mantine/core'

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
      <Container size="xs" py="xl" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center' }}>
        <Paper p="xl" withBorder style={{ width: '100%' }}>
          <Text c="dimmed">Verifying...</Text>
        </Paper>
      </Container>
    )
  }

  if (status === 'error') {
    return (
      <Container size="xs" py="xl" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center' }}>
        <Paper p="xl" withBorder style={{ width: '100%' }}>
          <Stack gap="md">
            <Title order={3}>Verification Failed</Title>
            <Text c="red">{error}</Text>
            <Button onClick={() => router.push('/login')} fullWidth>
              Back to Login
            </Button>
          </Stack>
        </Paper>
      </Container>
    )
  }

  return (
    <Container size="xs" py="xl" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center' }}>
      <Paper p="xl" withBorder style={{ width: '100%' }}>
        <Stack gap="md">
          <Title order={3}>Register This Device</Title>
          <Text c="dimmed">
            Your email has been verified. Now register this device with biometrics.
          </Text>
          
          {error && (
            <Alert color="red" title="Error">
              {error}
            </Alert>
          )}
          
          <Button 
            onClick={handleRegisterDevice} 
            loading={registerLoading}
            fullWidth
          >
            🔒 Register with Face ID / Touch ID
          </Button>
        </Stack>
      </Paper>
    </Container>
  )
}

export default function VerifyDevicePage() {
  return (
    <Suspense fallback={
      <Container size="xs" py="xl" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center' }}>
        <Paper p="xl" withBorder style={{ width: '100%' }}>
          <Text c="dimmed">Loading...</Text>
        </Paper>
      </Container>
    }>
      <VerifyDeviceContent />
    </Suspense>
  )
}
