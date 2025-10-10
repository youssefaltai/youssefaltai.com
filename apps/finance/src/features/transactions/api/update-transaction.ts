/**
 * Update transaction API handler
 */
import { prisma } from '@repo/db'
import { convertCurrency } from '@repo/utils'
import { UpdateTransactionSchema, type UpdateTransactionInput } from '../validation'

export async function updateTransaction(
  userId: string,
  transactionId: string,
  data: UpdateTransactionInput
) {
  // Validate input
  const validatedData = UpdateTransactionSchema.parse(data)

  // Verify ownership
  const existing = await prisma.transaction.findFirst({
    where: {
      id: transactionId,
      userId,
    },
  })

  if (!existing) {
    throw new Error('Transaction not found or unauthorized')
  }

  // If amount or currency changed, recalculate conversion
  let updateData: any = { ...validatedData }

  if (validatedData.amount || validatedData.currency || validatedData.exchangeRate) {
    const userSettings = await prisma.userSettings.findUnique({
      where: { userId },
    })

    if (!userSettings) {
      throw new Error('User settings not found')
    }

    const conversion = await convertCurrency(
      Number(validatedData.amount ?? existing.amount),
      validatedData.currency ?? existing.currency,
      userSettings.baseCurrency,
      validatedData.exchangeRate ? Number(validatedData.exchangeRate) : undefined
    )

    updateData = {
      ...updateData,
      exchangeRate: conversion.rate,
      baseAmount: conversion.convertedAmount,
      baseCurrency: userSettings.baseCurrency,
      rateSource: conversion.source,
    }
  }

  // Convert date if provided
  if (validatedData.date) {
    updateData.date = new Date(validatedData.date)
  }

  // Update transaction
  const transaction = await prisma.transaction.update({
    where: { id: transactionId },
    data: updateData,
  })

  return transaction
}

