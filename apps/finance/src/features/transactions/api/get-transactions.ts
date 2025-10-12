import { prisma, TTransaction, Prisma } from "@repo/db"
import { PaginatedResponse } from "@repo/types"
import { TRANSACTION_OMIT_FIELDS } from "../../../shared/omit-fields"
import { GetTransactionsQuerySchema } from "../validation"

/**
 * Get transactions with advanced filtering, pagination, and sorting
 * @param userId - User ID
 * @param filters - Query filters (dates, amounts, accounts, type, search, pagination, sorting)
 * @returns Paginated transactions with metadata
 */
export default async function getTransactions(
    userId: string,
    filters: GetTransactionsQuerySchema
): Promise<PaginatedResponse<TTransaction>> {
    const {
        dateFrom,
        dateTo,
        accountIds,
        minAmount,
        maxAmount,
        type,
        search,
        page,
        limit,
        sortBy,
        sortOrder,
    } = filters

    // Build where clause dynamically
    const where: Prisma.TransactionWhereInput = {
        userId,
        deletedAt: null,
    }

    // Build fromAccount filter
    const fromAccountFilter: Prisma.AccountWhereInput = {
        deletedAt: null,
        userId,
    }

    // Build toAccount filter
    const toAccountFilter: Prisma.AccountWhereInput = {
        deletedAt: null,
        userId,
    }

    // Transaction type filter based on account types
    if (type) {
        switch (type) {
            case 'income':
                // Income: FROM income account TO asset account
                fromAccountFilter.type = 'income'
                toAccountFilter.type = 'asset'
                break
            case 'expense':
                // Expense: FROM asset account TO expense account
                fromAccountFilter.type = 'asset'
                toAccountFilter.type = 'expense'
                break
            case 'transfer':
                // Transfer: FROM asset account TO asset account
                fromAccountFilter.type = 'asset'
                toAccountFilter.type = 'asset'
                break
        }
    }

    // Apply account filters
    where.fromAccount = fromAccountFilter
    where.toAccount = toAccountFilter

    // Date range filter
    if (dateFrom || dateTo) {
        where.date = {}
        if (dateFrom) {
            where.date.gte = new Date(dateFrom)
        }
        if (dateTo) {
            where.date.lte = new Date(dateTo)
        }
    }

    // Account filter - transactions involving any of the specified accounts
    if (accountIds && accountIds.length > 0) {
        where.OR = [
            { fromAccountId: { in: accountIds } },
            { toAccountId: { in: accountIds } },
        ]
    }

    // Amount range filter
    if (minAmount !== undefined || maxAmount !== undefined) {
        where.amount = {}
        if (minAmount !== undefined) {
            where.amount.gte = minAmount
        }
        if (maxAmount !== undefined) {
            where.amount.lte = maxAmount
        }
    }

    // Search filter (case-insensitive description search)
    if (search) {
        where.description = {
            contains: search,
            mode: 'insensitive',
        }
    }

    // Count total matching transactions for pagination
    const total = await prisma.transaction.count({ where })

    // Calculate pagination values
    const pages = Math.ceil(total / limit)
    const skip = (page - 1) * limit
    const hasMore = page < pages

    // Build orderBy clause
    const orderBy: Prisma.TransactionOrderByWithRelationInput = {
        [sortBy]: sortOrder,
    }

    // Fetch transactions with filters, pagination, and sorting
    const transactions = await prisma.transaction.findMany({
        where,
        include: {
            fromAccount: {
                select: {
                    id: true,
                    name: true,
                    description: true,
                    currency: true,
                    balance: true,
                    type: true, // Include type for frontend logic
                },
            },
            toAccount: {
                select: {
                    id: true,
                    name: true,
                    description: true,
                    currency: true,
                    balance: true,
                    type: true, // Include type for frontend logic
                },
            },
        },
        omit: {
            ...TRANSACTION_OMIT_FIELDS,
            fromAccountId: true,
            toAccountId: true,
        },
        orderBy,
        skip,
        take: limit,
    })

    return {
        data: transactions,
        pagination: {
            page,
            limit,
            total,
            pages,
            hasMore,
        },
    }
}
