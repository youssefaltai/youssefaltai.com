/**
 * Database seed script
 * Creates your user account from environment variables
 */
import { PrismaClient } from '../generated/prisma'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const email = process.env.ADMIN_EMAIL
  const password = process.env.ADMIN_PASSWORD
  const name = process.env.ADMIN_NAME || 'Youssef'

  if (!email || !password) {
    throw new Error('ADMIN_EMAIL and ADMIN_PASSWORD environment variables are required')
  }

  console.log('🌱 Seeding database...')

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10)

  // Upsert user (create or update if exists)
  const user = await prisma.user.upsert({
    where: { email },
    update: {
      password: hashedPassword,
      name,
    },
    create: {
      email,
      password: hashedPassword,
      name,
    },
  })

  console.log(`✅ User created/updated: ${user.email}`)
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

