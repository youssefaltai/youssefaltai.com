'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Input, CurrencySelect, Select, FormActions, ChipSelect } from '@repo/ui'
import type { ChipSelectOption } from '@repo/ui'
import { CURRENCY_OPTIONS } from '../../utils/currencies'
import { useFormState } from '../../hooks/use-form-state'
import { createBudgetSchema, type CreateBudgetSchema } from '../../features/budgets/validation'
import { useExpenseCategories } from '../../hooks/use-expense-categories'
import { parseISO, format, startOfMonth, endOfMonth, addMonths, startOfQuarter, endOfQuarter } from '@repo/utils'
import { useState, useEffect } from 'react'

interface BudgetFormProps {
  initialData?: Partial<CreateBudgetSchema> & { id?: string }
  onSubmit: (data: CreateBudgetSchema) => Promise<void>
  onCancel: () => void
}

type DatePreset = 'this-month' | 'next-month' | 'this-quarter' | 'custom'

/**
 * Form for creating/editing budgets
 */
export function BudgetForm({ initialData, onSubmit, onCancel }: BudgetFormProps) {
  const { submitError, handleSubmit: handleFormSubmit } = useFormState({
    onSubmit,
  })

  const { data: expenseCategories = [], isLoading: isLoadingCategories } = useExpenseCategories()

  const [datePreset, setDatePreset] = useState<DatePreset>('this-month')

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
  } = useForm<CreateBudgetSchema>({
    resolver: zodResolver(createBudgetSchema),
    defaultValues: {
      name: initialData?.name || '',
      amount: initialData?.amount || 0,
      currency: initialData?.currency || 'EGP',
      startDate: initialData?.startDate || startOfMonth(new Date()).toISOString(),
      endDate: initialData?.endDate || endOfMonth(new Date()).toISOString(),
      accountIds: initialData?.accountIds || [],
    },
  })

  const accountIds = watch('accountIds')
  const watchedStartDate = watch('startDate')
  const watchedEndDate = watch('endDate')

  // Apply date preset when changed
  useEffect(() => {
    if (datePreset === 'custom') return

    const now = new Date()
    let start: Date
    let end: Date

    switch (datePreset) {
      case 'this-month':
        start = startOfMonth(now)
        end = endOfMonth(now)
        break
      case 'next-month':
        start = startOfMonth(addMonths(now, 1))
        end = endOfMonth(addMonths(now, 1))
        break
      case 'this-quarter':
        start = startOfQuarter(now)
        end = endOfQuarter(now)
        break
      default:
        return
    }

    setValue('startDate', start.toISOString())
    setValue('endDate', end.toISOString())
  }, [datePreset, setValue])

  const onFormSubmit = async (data: CreateBudgetSchema) => {
    await handleFormSubmit(data, 'Failed to save budget')
  }

  const toggleAccount = (accountId: string) => {
    const currentIds = accountIds || []
    if (currentIds.includes(accountId)) {
      setValue('accountIds', currentIds.filter(id => id !== accountId))
    } else {
      setValue('accountIds', [...currentIds, accountId])
    }
  }

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
      <Input
        label="Budget Name"
        {...register('name')}
        placeholder="e.g., Monthly Groceries, Entertainment"
        error={errors.name?.message}
        required
      />

      <Input
        type="number"
        label="Budget Amount"
        {...register('amount', { valueAsNumber: true })}
        error={errors.amount?.message}
        placeholder="0.00"
        step="0.01"
        min="0"
        required
      />

      <CurrencySelect
        {...register('currency')}
        currencies={CURRENCY_OPTIONS}
        error={errors.currency?.message}
        required
      />

      {/* Date Preset Selector */}
      <Select
        label="Budget Period"
        value={datePreset}
        onChange={(e) => setDatePreset(e.target.value as DatePreset)}
      >
        <option value="this-month">This Month</option>
        <option value="next-month">Next Month</option>
        <option value="this-quarter">This Quarter</option>
        <option value="custom">Custom</option>
      </Select>

      {/* Custom Date Inputs (only visible when custom is selected) */}
      {datePreset === 'custom' && (
        <>
          <Input
            type="date"
            label="Start Date"
            value={format(parseISO(watchedStartDate), 'yyyy-MM-dd')}
            onChange={(e) => {
              const dateValue = e.target.value
              const newDate = parseISO(dateValue + 'T00:00:00')
              setValue('startDate', newDate.toISOString(), { shouldValidate: true })
            }}
            error={errors.startDate?.message}
            required
          />

          <Input
            type="date"
            label="End Date"
            value={format(parseISO(watchedEndDate), 'yyyy-MM-dd')}
            onChange={(e) => {
              const dateValue = e.target.value
              const newDate = parseISO(dateValue + 'T23:59:59.999')
              setValue('endDate', newDate.toISOString(), { shouldValidate: true })
            }}
            error={errors.endDate?.message}
            required
          />
        </>
      )}

      {/* Expense Categories Multi-Select */}
      {isLoadingCategories ? (
        <div>
          <label className="block text-ios-body font-medium text-ios-label-primary mb-2">
            Expense Categories *
          </label>
          <p className="text-ios-footnote text-ios-gray-1">Loading categories...</p>
        </div>
      ) : (
        <div>
          <ChipSelect
            label="Expense Categories *"
            options={expenseCategories.map(
              (category): ChipSelectOption => ({
                id: category.id,
                label: category.name,
              })
            )}
            selectedIds={accountIds || []}
            onToggle={toggleAccount}
            emptyMessage="No expense categories found. Create some first."
          />
          {errors.accountIds && (
            <p className="text-ios-footnote text-ios-red mt-1">{errors.accountIds.message}</p>
          )}
        </div>
      )}

      {submitError && (
        <p className="text-ios-footnote text-ios-red">{submitError}</p>
      )}

      <FormActions
        onCancel={onCancel}
        isSubmitting={isSubmitting}
        submitLabel={initialData?.id ? 'Update' : 'Create'}
      />
    </form>
  )
}

