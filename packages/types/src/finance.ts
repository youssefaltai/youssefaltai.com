/**
 * Shared TypeScript types for Finance app
 * Single source of truth for data models
 */

export interface Transaction {
  id: string
  amount: number
  currency: string
  baseAmount: number
  baseCurrency: string
  exchangeRate?: number
  rateSource?: string
  type: 'income' | 'expense'
  category: string
  description?: string
  date: string
  createdAt: string
  updatedAt: string
}

export interface Category {
  id: string
  name: string
  type: 'income' | 'expense'
  color?: string
  icon?: string
  userId: string
  createdAt: string
  updatedAt: string
}

export interface Summary {
  dateFrom: string
  dateTo: string
  baseCurrency: string
  income: number
  expenses: number
  balance: number
}

export interface Budget {
  id: string
  category: string
  limit: number
  spent: number
  currency: string
  period: 'monthly' | 'weekly' | 'yearly'
  userId: string
  createdAt: string
  updatedAt: string
}

export interface Goal {
  id: string
  name: string
  target: number
  current: number
  currency: string
  deadline: string
  userId: string
  createdAt: string
  updatedAt: string
}

export interface UserSettings {
  id: string
  baseCurrency: string
  userId: string
  createdAt: string
  updatedAt: string
}

// API Request/Response types
export interface CreateTransactionInput {
  type: 'income' | 'expense'
  amount: number
  currency: string
  exchangeRate?: number
  categoryId: string
  description?: string
  date: string
}

export interface UpdateTransactionInput extends Partial<CreateTransactionInput> {
  id: string
}

export interface TransactionFilters {
  type?: 'income' | 'expense'
  category?: string
  dateFrom?: string
  dateTo?: string
  limit?: number
  offset?: number
}

export interface CreateCategoryInput {
  name: string
  type: 'income' | 'expense'
  color?: string
  icon?: string
}

export interface CategoryFilters {
  type?: 'income' | 'expense'
}

export interface SummaryFilters {
  dateFrom?: string
  dateTo?: string
}

