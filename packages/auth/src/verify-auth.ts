import { getSession } from './lib/session-simple'

type VerifyAuthResponse = {
  authenticated: true
  userId: string
} | {
  authenticated: false
  userId: null
}

export async function verifyAuth(): Promise<VerifyAuthResponse> {
  return { authenticated: true, userId: 'cmgouyjv90000z3fyf5mhibye' }; // TODO: Remove this after testing

  try {
    const userId = await getSession()
    if (!userId) return { authenticated: false, userId: null }
    return { authenticated: true, userId: userId as string }
  } catch (error) {
    console.warn('Session verification failed:', error)
    return { authenticated: false, userId: null }
  }
}