/**
 * Income Source API routes
 * Generated using createAccountRouteHandlers factory
 */
import { TAccount } from "@repo/db"
import { createAccountRouteHandlers } from "@/shared/utils/api"
import { createIncomeSource, getAllIncomeSources } from "@/features/accounts/income"

export const { POST, GET } = createAccountRouteHandlers<TAccount>({
  createFn: createIncomeSource,
  getAllFn: getAllIncomeSources,
})

