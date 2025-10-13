import { cookies } from 'next/headers'
import { createClient } from 'redis'

const SESSION_COOKIE = 'passkey_session'
const SESSION_TTL = 60 * 60 // 1 hour

let redis: ReturnType<typeof createClient> | null = null

async function getRedis() {
  if (!redis) {
    if (!process.env.REDIS_URL) {
      throw new Error('REDIS_URL environment variable is not set')
    }
    
    redis = createClient({ url: process.env.REDIS_URL })
    await redis.connect()
    
    redis.on('error', (err) => {
      console.error('Redis session client error:', err)
    })
  }
  return redis
}

export async function createSession(userId: string): Promise<void> {
  const sessionId = crypto.randomUUID()
  const client = await getRedis()
  
  // Store userId in Redis
  await client.setEx(`session:${sessionId}`, SESSION_TTL, userId)
  
  // Store only sessionId in cookie
  const cookieStore = await cookies()
  cookieStore.set(SESSION_COOKIE, sessionId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: SESSION_TTL,
    path: '/',
  })
}

export async function getSession(): Promise<string | null> {
  const cookieStore = await cookies()
  const sessionId = cookieStore.get(SESSION_COOKIE)?.value
  
  if (!sessionId) return null
  
  // Lookup userId in Redis
  const client = await getRedis()
  const userId = await client.get(`session:${sessionId}`)
  
  return userId
}

export async function deleteSession(): Promise<void> {
  const cookieStore = await cookies()
  const sessionId = cookieStore.get(SESSION_COOKIE)?.value
  
  if (sessionId) {
    // Delete from Redis
    const client = await getRedis()
    await client.del(`session:${sessionId}`)
  }
  
  // Delete cookie
  cookieStore.delete(SESSION_COOKIE)
}

