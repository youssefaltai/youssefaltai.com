/**
 * Create transaction API handler
 */
import { prisma } from '@repo/db'
import { convertCurrency } from '@repo/utils'
import { CreateTransactionSchema, type CreateTransactionInput } from '../validation'

export async function createTransaction(userId: string, data: CreateTransactionInput) {
  // Validate input
  const validatedData = CreateTransactionSchema.parse(data)

  // Get user's base currency
  let userSettings = await prisma.userSettings.findUnique({
    where: { userId },
  })

  // Create default settings if not exists
  if (!userSettings) {
    userSettings = await prisma.userSettings.create({
      data: {
        userId,
        baseCurrency: 'EGP', // Default to EGP
      },
    })
  }

  // Convert currency if needed
  let conversion
  try {
    conversion = await convertCurrency(
      Number(validatedData.amount),
      validatedData.currency,
      userSettings.baseCurrency,
      validatedData.exchangeRate ? Number(validatedData.exchangeRate) : undefined
    )
  } catch (error) {
    console.error('Currency conversion failed:', error)
    throw new Error(`Currency conversion failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }

  // Create transaction
  const transactionData = {
    userId,
    amount: validatedData.amount,
    currency: validatedData.currency,
    exchangeRate: conversion.rate,
    baseAmount: conversion.convertedAmount,
    baseCurrency: userSettings.baseCurrency,
    rateSource: conversion.source,
    type: validatedData.type,
    category: validatedData.category,
    description: validatedData.description,
    date: new Date(validatedData.date),
  }
  
  const transaction = await prisma.transaction.create({
    data: transactionData,
  })

  return transaction
}

