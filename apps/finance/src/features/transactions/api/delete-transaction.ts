/**
 * Delete transaction API handler
 */
import { prisma } from '@repo/db'

export async function deleteTransaction(userId: string, transactionId: string) {
  // Verify ownership and delete
  const transaction = await prisma.transaction.deleteMany({
    where: {
      id: transactionId,
      userId, // Ensure user owns this transaction
    },
  })

  if (transaction.count === 0) {
    throw new Error('Transaction not found or unauthorized')
  }

  return { success: true }
}

