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
  // For passkeys to work across all apps, we must use the root domain
  // not the app-specific subdomain (e.g., youssefaltai.com not finance.youssefaltai.com)
  if (!process.env.APP_URL) {
    throw new Error('APP_URL environment variable is not set')
  }

  if (!process.env.PASSKEY_DOMAIN) {
    throw new Error('PASSKEY_DOMAIN environment variable is not set. Set it to your root domain (e.g., youssefaltai.com or localhost for development)')
  }

  const APP_URL = process.env.APP_URL!;
  const rpID = process.env.PASSKEY_DOMAIN;
  const expectedOrigin = APP_URL;

  const rpConfig = {
    rpID,
    rpName: 'Youssef al-Tai',
    expectedOrigin,
  }

  return { adapter: passkeyAdapter, store: challengeStore, rpConfig }
}

