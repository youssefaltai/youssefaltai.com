/**
 * Shared TypeScript types for all apps
 * Pure type definitions - zero runtime code
 */

// Auth types
export type { AuthUser, JWTPayload } from './auth'

// Finance types
export type {
  Transaction,
  Category,
  Summary,
  Budget,
  Goal,
  UserSettings,
  CreateTransactionInput,
  UpdateTransactionInput,
  TransactionFilters,
  CreateCategoryInput,
  CategoryFilters,
  SummaryFilters,
} from './finance'

