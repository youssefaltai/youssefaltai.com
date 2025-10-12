import { Currency, AccountType } from "@repo/db"
import { z } from "zod"
import {
    differentAccountsRefinement,
    currencyRequiredWithExchangeRateRefinement,
} from "../../shared/validation-refinements"

export const createTransactionSchema = z.object({
    description: z.string().min(1),
    fromAccountId: z.cuid(),
    toAccountId: z.cuid(),
    amount: z.number().positive(),
    currency: z.enum(Currency).optional(),
    exchangeRate: z.number().positive().optional(),
    date: z.iso.datetime(),
}).refine(differentAccountsRefinement(false), {
    message: "From and to accounts must be different",
    path: ["toAccountId"],
}).refine(currencyRequiredWithExchangeRateRefinement(), {
    message: "Currency is required when exchange rate is provided",
    path: ["currency"],
})

export type CreateTransactionSchema = z.infer<typeof createTransactionSchema>

export const updateTransactionSchema = z.object({
    description: z.string().min(1).optional(),
    fromAccountId: z.cuid().optional(),
    toAccountId: z.cuid().optional(),
    amount: z.number().positive().optional(),
    currency: z.enum(Currency).optional(),
    exchangeRate: z.number().positive().optional(),
    date: z.iso.datetime().optional(),
}).refine(differentAccountsRefinement(true), {
    message: "From and to accounts must be different",
    path: ["toAccountId"],
}).refine(currencyRequiredWithExchangeRateRefinement(), {
    message: "Currency is required when exchange rate is provided",
    path: ["currency"],
})

export type UpdateTransactionSchema = z.infer<typeof updateTransactionSchema>

// Transaction type enum for filtering
export const TransactionTypeEnum = z.enum(['income', 'expense', 'transfer'])
export type TransactionType = z.infer<typeof TransactionTypeEnum>

// Sort options
export const SortByEnum = z.enum(['date', 'amount', 'createdAt'])
export const SortOrderEnum = z.enum(['asc', 'desc'])

// Query filters schema for GET /api/transactions
export const getTransactionsQuerySchema = z.object({
    // Date range
    dateFrom: z.iso.datetime().optional(),
    dateTo: z.iso.datetime().optional(),
    
    // Account filtering
    fromAccountIds: z.array(z.cuid()).optional(),
    toAccountIds: z.array(z.cuid()).optional(),
    
    // Amount range
    minAmount: z.number().positive().optional(),
    maxAmount: z.number().positive().optional(),
    
    // Transaction type
    type: TransactionTypeEnum.optional(),
    
    // Search
    search: z.string().optional(),
    
    // Pagination
    page: z.number().int().positive().default(1),
    limit: z.number().int().positive().max(200).default(50),
    
    // Sorting
    sortBy: SortByEnum.default('date'),
    sortOrder: SortOrderEnum.default('desc'),
})

export type GetTransactionsQuerySchema = z.infer<typeof getTransactionsQuerySchema>

// Query schema for GET /api/transactions/summary
export const getTransactionsSummaryQuerySchema = z.object({
    // Date range (required for summary)
    dateFrom: z.iso.datetime(),
    dateTo: z.iso.datetime(),
    
    // Optional account filtering
    accountIds: z.array(z.cuid()).optional(),
})

export type GetTransactionsSummaryQuerySchema = z.infer<typeof getTransactionsSummaryQuerySchema>

/**
 * Determine transaction type based on account types
 * @param fromAccountType - Type of the FROM account
 * @param toAccountType - Type of the TO account
 * @returns Transaction type (income, expense, or transfer)
 */
export function determineTransactionType(
    fromAccountType: AccountType,
    toAccountType: AccountType
): TransactionType {
    // Income: Money coming from income account to asset account
    if (fromAccountType === 'income' && toAccountType === 'asset') {
        return 'income'
    }
    
    // Expense: Money going from asset account to expense account
    if (fromAccountType === 'asset' && toAccountType === 'expense') {
        return 'expense'
    }
    
    // Transfer: Money moving between asset accounts (or any other combination)
    return 'transfer'
}
