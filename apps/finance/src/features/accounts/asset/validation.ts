import { z } from "zod"
import { baseCreateAccountSchema, baseUpdateAccountSchema } from "../shared/validation"

// Asset Account creation schema
export const createAssetAccountSchema = baseCreateAccountSchema

export type CreateAssetAccountSchema = z.infer<typeof createAssetAccountSchema>

// Asset Account update schema
export const updateAssetAccountSchema = baseUpdateAccountSchema

export type UpdateAssetAccountSchema = z.infer<typeof updateAssetAccountSchema>

