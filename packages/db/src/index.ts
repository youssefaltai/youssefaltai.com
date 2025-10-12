/**
 * Database client singleton
 * Shared Prisma client instance across the monorepo
 */
import { PrismaClient } from '../generated/prisma'

// Prevent multiple instances in development
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  })

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}

// Re-export Prisma types for convenience
export { PrismaClient, Prisma, Currency, $Enums, } from '../generated/prisma'
export type { Account, AccountType, Credential, PrismaPromise, Transaction, User } from '../generated/prisma'
export type { TAccount, TTransaction, TGoal, TEquity, TExpense, TIncome } from './types/finance'
