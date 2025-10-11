'use client'

import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button, Input, Select } from '@repo/ui'
import { cn, currentMonthRange } from '@repo/utils'
import { useCategories } from '@/features/categories/hooks/useCategories'
import { useUserSettings } from '@/features/settings/hooks/useUserSettings'
import { useCreateBudget } from '../hooks/useCreateBudget'
import { useUpdateBudget } from '../hooks/useUpdateBudget'
import { 
  CreateBudgetSchema, 
  UpdateBudgetSchema, 
  type CreateBudgetInput, 
  type UpdateBudgetInput 
} from '../validation'
import type { Budget } from '@repo/types'

interface BudgetFormProps {
  budget?: Budget
  onSuccess?: () => void
  onCancel?: () => void
}

/**
 * Budget Form Component
 * 
 * Features:
 * - Budget name and amount
 * - Multi-select categories (chips)
 * - Date range selection
 * - Quick preset for current month
 */
export function BudgetForm({ budget, onSuccess, onCancel }: BudgetFormProps) {
  const isEditMode = !!budget
  const { data: categories = [] } = useCategories()
  const { data: userSettings } = useUserSettings()
  const createBudget = useCreateBudget()
  const updateBudget = useUpdateBudget(budget?.id || '')

  // Get expense categories only (budgets are for expenses)
  const expenseCategories = categories.filter(cat => cat.type === 'expense')

  // Get current month range for default dates
  const { start: monthStart, end: monthEnd } = currentMonthRange()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    watch,
    setValue,
  } = useForm<CreateBudgetInput | UpdateBudgetInput>({
    resolver: zodResolver(isEditMode ? UpdateBudgetSchema : CreateBudgetSchema),
    defaultValues: {
      name: budget?.name || '',
      amount: budget?.amount || 0,
      currency: (budget?.currency || userSettings?.baseCurrency || 'EGP') as 'EGP' | 'USD' | 'GOLD_G',
      categories: budget?.categories || [],
      startDate: budget?.startDate 
        ? new Date(budget.startDate).toISOString().slice(0, 10)
        : monthStart.toISOString().slice(0, 10),
      endDate: budget?.endDate 
        ? new Date(budget.endDate).toISOString().slice(0, 10)
        : monthEnd.toISOString().slice(0, 10),
    },
  })

  const selectedCategories = watch('categories') || []

  // Update form when budget prop changes
  useEffect(() => {
    if (budget) {
      reset({
        name: budget.name,
        amount: budget.amount,
        currency: budget.currency as 'EGP' | 'USD' | 'GOLD_G',
        categories: budget.categories,
        startDate: new Date(budget.startDate).toISOString().slice(0, 10),
        endDate: new Date(budget.endDate).toISOString().slice(0, 10),
      })
    }
  }, [budget, reset])

  const toggleCategory = (categoryName: string) => {
    const current = selectedCategories as string[]
    if (current.includes(categoryName)) {
      setValue('categories', current.filter(c => c !== categoryName))
    } else {
      setValue('categories', [...current, categoryName])
    }
  }

  const setCurrentMonth = () => {
    setValue('startDate', monthStart.toISOString().slice(0, 10))
    setValue('endDate', monthEnd.toISOString().slice(0, 10))
  }

  const onSubmit = (data: CreateBudgetInput | UpdateBudgetInput) => {
    // Convert dates to ISO datetime
    const submitData = {
      ...data,
      startDate: new Date(data.startDate!).toISOString(),
      endDate: new Date(data.endDate!).toISOString(),
    }

    if (isEditMode) {
      updateBudget.mutate(submitData as UpdateBudgetInput, {
        onSuccess: () => {
          onSuccess?.()
        },
      })
    } else {
      createBudget.mutate(submitData as CreateBudgetInput, {
        onSuccess: () => {
          reset()
          onSuccess?.()
        },
      })
    }
  }

  const mutation = isEditMode ? updateBudget : createBudget

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Budget Name */}
      <div>
        <Input
          label="Budget Name"
          type="text"
          placeholder="e.g., Monthly Food Budget"
          error={errors.name?.message}
          required
          {...register('name')}
        />
      </div>

      {/* Amount */}
      <div>
        <Input
          label="Budget Amount"
          type="number"
          step="0.01"
          min="0"
          placeholder="0.00"
          error={errors.amount?.message}
          required
          {...register('amount', { 
            setValueAs: (value) => {
              if (value === '' || value === null) return 0
              const parsed = parseFloat(value)
              return isNaN(parsed) ? 0 : parsed
            }
          })}
        />
      </div>

      {/* Currency */}
      <div>
        <Select
          label="Currency"
          error={errors.currency?.message}
          options={[
            { value: 'EGP', label: 'EGP - Egyptian Pound' },
            { value: 'USD', label: 'USD - US Dollar' },
            { value: 'GOLD_G', label: 'GOLD - Gold (grams)' },
          ]}
          {...register('currency')}
        />
      </div>

      {/* Category Selection (Multi-select Chips) */}
      <div>
        <label className="block text-ios-callout font-medium text-ios-label-primary mb-2">
          Categories <span className="text-ios-red">*</span>
        </label>
        {expenseCategories.length === 0 ? (
          <div className="text-center py-8 px-4 bg-ios-gray-6 rounded-ios">
            <p className="text-ios-callout text-ios-gray-1">
              No expense categories available
            </p>
            <p className="text-ios-footnote text-ios-gray-2 mt-1">
              Create categories in the Categories page
            </p>
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {expenseCategories.map((category) => {
              const isSelected = (selectedCategories as string[]).includes(category.name)
              return (
                <button
                  key={category.id}
                  type="button"
                  onClick={() => toggleCategory(category.name)}
                  className={cn(
                    'flex items-center gap-2 px-4 py-2 rounded-full transition-all',
                    isSelected
                      ? 'bg-ios-blue text-white ring-2 ring-ios-blue scale-105'
                      : 'bg-ios-gray-6 hover:bg-ios-gray-5 text-ios-label-primary'
                  )}
                >
                  <span className="text-ios-callout font-medium">{category.name}</span>
                </button>
              )
            })}
          </div>
        )}
        {errors.categories && (
          <p className="text-ios-red text-ios-footnote mt-2">{errors.categories.message}</p>
        )}
        <p className="text-ios-footnote text-ios-gray-1 mt-2">
          Select one or more categories to track together
        </p>
      </div>

      {/* Date Range */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-ios-callout font-medium text-ios-label-primary">
            Budget Period <span className="text-ios-red">*</span>
          </label>
          <button
            type="button"
            onClick={setCurrentMonth}
            className="text-ios-footnote text-ios-blue font-medium"
          >
            This Month
          </button>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-ios-footnote text-ios-gray-1 mb-1 ml-1">Start Date</label>
            <input
              type="date"
              className="w-full min-h-[44px] px-4 py-2 bg-ios-gray-6 rounded-ios text-ios-body focus:outline-none focus:ring-2 focus:ring-ios-blue"
              {...register('startDate')}
            />
            {errors.startDate && (
              <p className="text-ios-red text-ios-footnote mt-1">{errors.startDate.message}</p>
            )}
          </div>
          <div>
            <label className="block text-ios-footnote text-ios-gray-1 mb-1 ml-1">End Date</label>
            <input
              type="date"
              className="w-full min-h-[44px] px-4 py-2 bg-ios-gray-6 rounded-ios text-ios-body focus:outline-none focus:ring-2 focus:ring-ios-blue"
              {...register('endDate')}
            />
            {errors.endDate && (
              <p className="text-ios-red text-ios-footnote mt-1">{errors.endDate.message}</p>
            )}
          </div>
        </div>
      </div>

      {/* Error Message */}
      {mutation.error && (
        <div className="bg-ios-red/10 border border-ios-red text-ios-red px-4 py-3 rounded-ios text-ios-callout">
          {mutation.error instanceof Error 
            ? mutation.error.message 
            : `Failed to ${isEditMode ? 'update' : 'create'} budget`}
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
            : (isEditMode ? 'Update Budget' : 'Create Budget')}
        </Button>
      </div>
    </form>
  )
}

