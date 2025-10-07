/**
 * Challenge storage using Redis
 * Stores WebAuthn challenges with automatic expiration
 */
import Redis from 'ioredis'

const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
  lazyConnect: true,
  maxRetriesPerRequest: 3,
})

// Challenge expires in 5 minutes (industry standard)
const CHALLENGE_TTL = 60 * 5

/**
 * Store a challenge for a user
 */
export async function storeChallenge(userId: string, challenge: string): Promise<void> {
  const key = `webauthn:challenge:${userId}`
  await redis.setex(key, CHALLENGE_TTL, challenge)
}

/**
 * Get and delete challenge (single-use)
 */
export async function consumeChallenge(userId: string): Promise<string | null> {
  const key = `webauthn:challenge:${userId}`
  const challenge = await redis.getdel(key)
  return challenge
}

