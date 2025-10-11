'use client'

import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button, Input, Select } from '@repo/ui'
import { cn } from '@repo/utils'
import { useCategories } from '@/features/categories/hooks/useCategories'
import { useUserSettings } from '@/features/settings/hooks/useUserSettings'
import { useCreateTransaction } from '../hooks/useCreateTransaction'
import { useUpdateTransaction } from '../hooks/useUpdateTransaction'
import { CreateTransactionSchema, UpdateTransactionSchema, type CreateTransactionInput, type UpdateTransactionInput } from '../validation'
import type { Transaction } from '@repo/types'

interface TransactionFormProps {
  transaction?: Transaction // If provided, form is in edit mode
  onSuccess?: () => void
  onCancel?: () => void
}

/**
 * Transaction Form Component
 * 
 * Uses React Hook Form for:
 * - Automatic validation with Zod schema
 * - Better performance (less re-renders)
 * - Built-in error handling
 * - Form state management
 * 
 * Features:
 * - Amount and currency
 * - Category selection
 * - Transaction type (income/expense)
 * - Date selection
 * - Optional description
 */
export function TransactionForm({ transaction, onSuccess, onCancel }: TransactionFormProps) {
  const isEditMode = !!transaction
  const { data: categories = [] } = useCategories()
  const { data: userSettings } = useUserSettings()
  const createTransaction = useCreateTransaction()
  const updateTransaction = useUpdateTransaction(transaction?.id || '')

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    watch,
    setValue,
  } = useForm<CreateTransactionInput | UpdateTransactionInput>({
    resolver: zodResolver(isEditMode ? UpdateTransactionSchema : CreateTransactionSchema),
    defaultValues: {
      type: transaction?.type || 'expense',
      amount: transaction?.amount || 0,
      currency: (transaction?.currency as 'EGP' | 'USD' | 'GOLD_G') || 'EGP',
      category: transaction?.category || categories[0]?.name || '',
      description: transaction?.description || '',
      date: transaction?.date ? new Date(transaction.date).toISOString().slice(0, 16) : new Date().toISOString().slice(0, 16),
      exchangeRate: transaction?.exchangeRate || undefined, // Empty by default, API will fetch rate
    },
  })

  const transactionType = watch('type')
  const selectedCategory = watch('category')
  const selectedCurrency = watch('currency')
  
  // Check if selected currency is different from base currency
  const baseCurrency = userSettings?.baseCurrency || 'EGP'
  const showExchangeRate = selectedCurrency !== baseCurrency

  // Filter categories by transaction type
  const filteredCategories = categories.filter(cat => cat.type === transactionType)

  // Clear exchange rate when currency matches base currency
  useEffect(() => {
    if (!showExchangeRate) {
      setValue('exchangeRate', undefined)
    }
  }, [showExchangeRate, setValue])

  // Update form when transaction prop changes
  useEffect(() => {
    if (transaction) {
      reset({
        type: transaction.type,
        amount: transaction.amount,
        currency: transaction.currency as 'EGP' | 'USD' | 'GOLD_G',
        category: transaction.category,
        description: transaction.description || '',
        date: new Date(transaction.date).toISOString().slice(0, 16),
        exchangeRate: transaction.exchangeRate || undefined,
      })
    }
  }, [transaction, reset])

  const onSubmit = (data: CreateTransactionInput | UpdateTransactionInput) => {
    // Ensure exchangeRate is properly handled (undefined if not shown, not empty string)
    const mutationData = {
      ...data,
      exchangeRate: data.exchangeRate === null || data.exchangeRate === undefined || (typeof data.exchangeRate === 'string' && data.exchangeRate === '') 
        ? undefined 
        : data.exchangeRate,
    }

    if (isEditMode) {
      updateTransaction.mutate(mutationData as UpdateTransactionInput, {
        onSuccess: () => {
          onSuccess?.()
        },
      })
    } else {
      createTransaction.mutate(mutationData as CreateTransactionInput, {
        onSuccess: () => {
          reset()
          onSuccess?.()
        },
      })
    }
  }

  const mutation = isEditMode ? updateTransaction : createTransaction

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Transaction Type */}
      <div>
        <label className="block text-ios-callout font-medium text-ios-label-primary mb-2">
          Type
        </label>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => setValue('type', 'expense')}
            className={`flex-1 py-3 px-4 rounded-ios text-ios-body font-medium transition-colors ${
              transactionType === 'expense'
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
              transactionType === 'income'
                ? 'bg-ios-green text-white'
                : 'bg-ios-gray-6 text-ios-label-secondary'
            }`}
          >
            Income
          </button>
        </div>
      </div>

      {/* Amount */}
      <div>
        <Input
          label="Amount"
          type="number"
          step="0.01"
          min="0"
          placeholder="0.00"
          error={errors.amount?.message}
          required
          {...register('amount', { valueAsNumber: true })}
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

      {/* Exchange Rate (Optional) - Only show if currency differs from base currency */}
      {showExchangeRate && (
        <div>
          <Input
            label="Exchange Rate (Optional)"
            type="number"
            step="0.000001"
            min="0"
            placeholder="Leave empty for automatic rate"
            error={errors.exchangeRate?.message}
            {...register('exchangeRate', { 
              setValueAs: (value) => {
                // Convert empty string to undefined, otherwise parse as number
                if (value === '' || value === null) return undefined
                const parsed = parseFloat(value)
                return isNaN(parsed) ? undefined : parsed
              }
            })}
          />
          <p className="text-ios-footnote text-ios-gray-1 mt-1">
            Leave empty to use current market rate, or enter manually if needed
          </p>
        </div>
      )}


      {/* Category Chips */}
      <div>
        <label className="block text-ios-callout font-medium text-ios-label-primary mb-2">
          Category <span className="text-ios-red">*</span>
        </label>
        {filteredCategories.length === 0 ? (
          <div className="text-center py-8 px-4 bg-ios-gray-6 rounded-ios">
            <p className="text-ios-callout text-ios-gray-1">
              No categories available for {transactionType}
            </p>
            <p className="text-ios-footnote text-ios-gray-2 mt-1">
              Create one in the Categories page
            </p>
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {filteredCategories.map((category) => (
              <button
                key={category.id}
                type="button"
                onClick={() => setValue('category', category.name)}
                className={cn(
                  'flex items-center gap-2 px-4 py-2 rounded-full transition-all',
                  selectedCategory === category.name
                    ? 'bg-ios-blue text-white ring-2 ring-ios-blue scale-105'
                    : 'bg-ios-gray-6 hover:bg-ios-gray-5 text-ios-label-primary'
                )}
              >
                <span className="text-ios-callout font-medium">{category.name}</span>
              </button>
            ))}
          </div>
        )}
        {errors.category && (
          <p className="text-ios-red text-ios-footnote mt-2">{errors.category.message}</p>
        )}
      </div>

      {/* Description (Optional) */}
      <div>
        <label htmlFor="description" className="block text-ios-callout font-medium text-ios-label-primary mb-2">
          Description (Optional)
        </label>
        <textarea
          id="description"
          placeholder="Add a note or description..."
          className="w-full px-4 py-3 rounded-ios bg-ios-gray-6 text-ios-label-primary placeholder-ios-gray-2 focus:outline-none focus:ring-2 focus:ring-ios-blue text-ios-body resize-none"
          rows={3}
          {...register('description')}
        />
        {errors.description && (
          <p className="text-ios-red text-ios-footnote mt-2">{errors.description.message}</p>
        )}
      </div>

      {/* Date & Time */}
      <div>
        <Input
          label="Date & Time"
          type="datetime-local"
          error={errors.date?.message}
          required
          {...register('date', {
            setValueAs: (value: string) => {
              // Convert datetime-local input to ISO datetime
              if (!value) return new Date().toISOString()
              return new Date(value).toISOString()
            },
          })}
        />
      </div>


      {/* Error Message */}
      {mutation.error && (
        <div className="bg-ios-red/10 border border-ios-red text-ios-red px-4 py-3 rounded-ios text-ios-callout">
          {mutation.error instanceof Error 
            ? mutation.error.message 
            : `Failed to ${isEditMode ? 'update' : 'create'} transaction`}
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
            ? (isEditMode ? 'Updating...' : 'Adding...') 
            : (isEditMode ? 'Update Transaction' : 'Add Transaction')}
        </Button>
      </div>
    </form>
  )
}

