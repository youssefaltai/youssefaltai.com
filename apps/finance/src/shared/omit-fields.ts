/**
 * Standard fields to omit when returning accounts to clients.
 * Excludes internal timestamps, soft-delete markers, and user ownership.
 */
const ACCOUNT_BASE_OMIT_FIELDS = {
  updatedAt: true,
  deletedAt: true,
} as const

/**
 * Omit fields for asset accounts (bank, cash, wallet).
 * Hides fields not relevant for basic asset accounts.
 */
export const ASSET_ACCOUNT_OMIT_FIELDS = {
  ...ACCOUNT_BASE_OMIT_FIELDS,
  target: true,
  dueDate: true,
} as const

/**
 * Omit fields for goals (asset accounts with target and dueDate).
 * Shows target and dueDate but hides irrelevant fields.
 */
export const GOAL_OMIT_FIELDS = {
  ...ACCOUNT_BASE_OMIT_FIELDS,
} as const

/**
 * Omit fields for loans (liability accounts with dueDate).
 * Shows dueDate but hides target field.
 */
export const LOAN_OMIT_FIELDS = {
  ...ACCOUNT_BASE_OMIT_FIELDS,
  target: true,
} as const

/**
 * Omit fields for credit cards, income, and expense accounts.
 * Hides fields not relevant for these account types.
 */
export const SIMPLE_ACCOUNT_OMIT_FIELDS = {
  ...ACCOUNT_BASE_OMIT_FIELDS,
  target: true,
  dueDate: true,
} as const

/**
 * Standard fields to omit when returning transactions to clients.
 * Excludes internal timestamps, soft-delete markers, and user ownership.
 */
export const TRANSACTION_OMIT_FIELDS = {
  userId: true,
  createdAt: true,
  updatedAt: true,
  deletedAt: true,
  fromAccountId: true,
  toAccountId: true,
} as const

/**
 * Standard fields to omit when returning budgets to clients.
 * Excludes internal timestamps, soft-delete markers, and user ownership.
 */
export const BUDGET_OMIT_FIELDS = {
  userId: true,
  updatedAt: true,
  deletedAt: true,
} as const

