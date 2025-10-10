/**
 * Category validation schemas
 * Using Zod for runtime type validation
 */
import { z } from 'zod'
import { TransactionTypeSchema } from '../transactions/validation'

// Create category schema
export const CreateCategorySchema = z.object({
  name: z.string().min(1, 'Category name is required').max(50, 'Category name too long'),
  type: TransactionTypeSchema,
  color: z.string().regex(/^#[0-9A-F]{6}$/i, 'Invalid color format').optional(),
  icon: z.string().max(10).optional(),
})

// Update category schema
export const UpdateCategorySchema = z.object({
  name: z.string().min(1, 'Category name is required').max(50, 'Category name too long').optional(),
  type: TransactionTypeSchema.optional(),
  color: z.string().regex(/^#[0-9A-F]{6}$/i, 'Invalid color format').optional(),
  icon: z.string().max(10).optional(),
})

// Type exports for TypeScript
export type CreateCategoryInput = z.infer<typeof CreateCategorySchema>
export type UpdateCategoryInput = z.infer<typeof UpdateCategorySchema>

