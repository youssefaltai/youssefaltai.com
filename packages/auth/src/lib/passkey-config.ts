import { prisma } from '@repo/db'
import { createClient as createRedisClient } from 'redis'
import { PrismaAdapter } from 'next-passkey-webauthn/adapters'
import { RedisStore } from 'next-passkey-webauthn/store'
import type { ServerOptions } from 'next-passkey-webauthn/types'
import { getNormalizedOrigin, getNormalizedRpId } from './domain-utils'

// Singleton Redis client
let redisClient: ReturnType<typeof createRedisClient> | null = null

async function getRedisClient() {
  if (!redisClient) {
    if (!process.env.REDIS_URL) {
      throw new Error('REDIS_URL environment variable is not set')
    }
    
    redisClient = createRedisClient({
      url: process.env.REDIS_URL,
    })
    await redisClient.connect()
    
    // Handle errors
    redisClient.on('error', (err) => {
      console.error('Redis passkey client error:', err)
    })
  }
  return redisClient
}

// Singleton adapter and store
let passkeyAdapter: PrismaAdapter | null = null
let challengeStore: RedisStore | null = null

export async function createPasskeyConfig(request: Request): Promise<ServerOptions> {
  // Initialize singletons if needed
  if (!passkeyAdapter) {
    passkeyAdapter = new PrismaAdapter(prisma as any)
  }
  
  if (!challengeStore) {
    const redis = await getRedisClient()
    challengeStore = new RedisStore(redis, 300)
  }

  // Extract normalized domain information
  const rpID = getNormalizedRpId(request.url)
  const expectedOrigin = getNormalizedOrigin(request.url)

  const rpConfig = {
    rpID,
    rpName: 'Youssef al-Tai',
    expectedOrigin,
  }

  return { adapter: passkeyAdapter, store: challengeStore, rpConfig }
}

