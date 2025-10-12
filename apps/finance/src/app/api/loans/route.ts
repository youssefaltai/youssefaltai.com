/**
 * Loan API routes
 * Generated using createAccountRouteHandlers factory
 */
import { TAccount } from "@repo/db"
import { createAccountRouteHandlers } from "@/shared/utils/api"
import { createLoan, getAllLoans } from "@/features/accounts/loan"

export const { POST, GET } = createAccountRouteHandlers<TAccount>({
  createFn: createLoan,
  getAllFn: getAllLoans,
})

