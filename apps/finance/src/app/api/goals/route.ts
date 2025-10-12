/**
 * Goal API routes
 * Generated using createAccountRouteHandlers factory
 */
import { TAccount } from "@repo/db"
import { createAccountRouteHandlers } from "@/shared/utils/api"
import { createGoal, getAllGoals } from "@/features/accounts/goal"

export const { POST, GET } = createAccountRouteHandlers<TAccount>({
  createFn: createGoal,
  getAllFn: getAllGoals,
})

