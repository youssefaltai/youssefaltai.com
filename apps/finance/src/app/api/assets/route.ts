/**
 * Asset API routes
 * Generated using createAccountRouteHandlers factory
 */
import { TAccount } from "@repo/db"
import { createAccountRouteHandlers } from "@/shared/utils/api"
import { createAssetAccount, getAllAssetAccounts } from "@/features/accounts/asset"

export const { POST, GET } = createAccountRouteHandlers<TAccount>({
  createFn: createAssetAccount,
  getAllFn: getAllAssetAccounts,
})

