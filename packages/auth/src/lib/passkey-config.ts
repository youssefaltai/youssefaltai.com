import { prisma } from '@repo/db'
import { createClient as createRedisClient } from 'redis'
import { PrismaAdapter } from 'next-passkey-webauthn/adapters'
import { RedisStore } from 'next-passkey-webauthn/store'
import type { ServerOptions } from 'next-passkey-webauthn/types'

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

export async function createPasskeyConfig(): Promise<ServerOptions> {
  // Initialize singletons if needed
  if (!passkeyAdapter) {
    passkeyAdapter = new PrismaAdapter(prisma as any)
  }

  if (!challengeStore) {
    const redis = await getRedisClient()
    challengeStore = new RedisStore(redis, 300)
  }

  // Extract normalized domain information
  // Extracts the domain (host) from APP_URL without schema or port
  if (!process.env.APP_URL) {
    throw new Error('APP_URL environment variable is not set')
  }

  const APP_URL = process.env.APP_URL!;
  const { hostname } = new URL(APP_URL);
  const rpID = hostname;
  const expectedOrigin = APP_URL;

  const rpConfig = {
    rpID,
    rpName: 'Youssef al-Tai',
    expectedOrigin,
  }

  return { adapter: passkeyAdapter, store: challengeStore, rpConfig }
}

