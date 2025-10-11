'use client'

import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button, Input } from '@repo/ui'
import { useCreateCategory } from '../hooks/useCreateCategory'
import { useUpdateCategory } from '../hooks/useUpdateCategory'
import { CreateCategorySchema, UpdateCategorySchema, type CreateCategoryInput, type UpdateCategoryInput } from '../validation'
import type { Category } from '@repo/types'

interface CategoryFormProps {
  category?: Category // If provided, form is in edit mode
  onSuccess?: () => void
  onCancel?: () => void
}

/**
 * Category Form Component
 * 
 * Simplified form with just name and type.
 * Uses React Hook Form for validation and state management.
 */
export function CategoryForm({ category, onSuccess, onCancel }: CategoryFormProps) {
  const isEditMode = !!category
  const createCategory = useCreateCategory()
  const updateCategory = useUpdateCategory(category?.id || '')

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    watch,
    setValue,
  } = useForm<CreateCategoryInput | UpdateCategoryInput>({
    resolver: zodResolver(isEditMode ? UpdateCategorySchema : CreateCategorySchema),
    defaultValues: {
      name: category?.name || '',
      type: category?.type || 'expense',
    },
  })

  const categoryType = watch('type')

  // Update form when category prop changes
  useEffect(() => {
    if (category) {
      reset({
        name: category.name,
        type: category.type,
      })
    }
  }, [category, reset])

  const onSubmit = (data: CreateCategoryInput | UpdateCategoryInput) => {
    if (isEditMode) {
      updateCategory.mutate(data as UpdateCategoryInput, {
        onSuccess: () => {
          onSuccess?.()
        },
      })
    } else {
      createCategory.mutate(data as CreateCategoryInput, {
        onSuccess: () => {
          reset()
          onSuccess?.()
        },
      })
    }
  }

  const mutation = isEditMode ? updateCategory : createCategory

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Category Type */}
      <div>
        <label className="block text-ios-callout font-medium text-ios-label-primary mb-2">
          Type
        </label>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => setValue('type', 'expense')}
            className={`flex-1 py-3 px-4 rounded-ios text-ios-body font-medium transition-colors ${
              categoryType === 'expense'
                ? 'bg-ios-red text-white'
                : 'bg-ios-gray-6 text-ios-label-secondary'
            }`}
          >
            Expense
          </button>
          <button
            type="button"
            onClick={() => setValue('type', 'income')}
            className={`flex-1 py-3 px-4 rounded-ios text-ios-body font-medium transition-colors ${
              categoryType === 'income'
                ? 'bg-ios-green text-white'
                : 'bg-ios-gray-6 text-ios-label-secondary'
            }`}
          >
            Income
          </button>
        </div>
      </div>

      {/* Category Name */}
      <div>
        <Input
          label="Category Name"
          type="text"
          placeholder="e.g., Groceries, Salary"
          error={errors.name?.message}
          required
          {...register('name')}
        />
      </div>

      {/* Error Message */}
      {mutation.error && (
        <div className="bg-ios-red/10 border border-ios-red text-ios-red px-4 py-3 rounded-ios text-ios-callout">
          {mutation.error instanceof Error 
            ? mutation.error.message 
            : `Failed to ${isEditMode ? 'update' : 'create'} category`}
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-3 pt-2">
        <Button
          type="button"
          variant="secondary"
          className="flex-1"
          onClick={onCancel}
          disabled={isSubmitting || mutation.isPending}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          variant="primary"
          className="flex-1"
          disabled={isSubmitting || mutation.isPending}
        >
          {isSubmitting || mutation.isPending 
            ? (isEditMode ? 'Updating...' : 'Creating...') 
            : (isEditMode ? 'Update Category' : 'Create Category')}
        </Button>
      </div>
    </form>
  )
}
