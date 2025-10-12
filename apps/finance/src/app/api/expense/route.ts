/**
 * Expense Category API routes
 * Generated using createAccountRouteHandlers factory
 */
import { TAccount } from "@repo/db"
import { createAccountRouteHandlers } from "@/shared/utils/api"
import { createExpenseCategory, getAllExpenseCategories } from "@/features/accounts/expense"

export const { POST, GET } = createAccountRouteHandlers<TAccount>({
  createFn: createExpenseCategory,
  getAllFn: getAllExpenseCategories,
})

