/**
 * Credit Card API routes
 * Generated using createAccountRouteHandlers factory
 */
import { TAccount } from "@repo/db"
import { createAccountRouteHandlers } from "@/shared/utils/api"
import { createCreditCard, getAllCreditCards } from "@/features/accounts/credit-card"

export const { POST, GET } = createAccountRouteHandlers<TAccount>({
  createFn: createCreditCard,
  getAllFn: getAllCreditCards,
})

