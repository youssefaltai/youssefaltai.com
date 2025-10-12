'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Input, CurrencySelect, Textarea } from '@repo/ui'
import { FormActions } from '@repo/ui'
import { CURRENCY_OPTIONS } from '../../utils/currencies'
import { useFormState } from '../../hooks/use-form-state'
import { createExpenseCategorySchema, type CreateExpenseCategorySchema } from '../../features/accounts/expense/validation'
import { emptyStringToUndefined } from '@/utils/form'

interface ExpenseCategoryFormProps {
  initialData?: Partial<CreateExpenseCategorySchema>
  onSubmit: (data: CreateExpenseCategorySchema) => Promise<void>
  onCancel: () => void
}

/**
 * Form for creating/editing expense categories
 */
export function ExpenseCategoryForm({ initialData, onSubmit, onCancel }: ExpenseCategoryFormProps) {
  const { submitError, handleSubmit: handleFormSubmit } = useFormState({
    onSubmit,
  })

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CreateExpenseCategorySchema>({
    resolver: zodResolver(createExpenseCategorySchema),
    defaultValues: {
      name: initialData?.name || '',
      description: initialData?.description || '',
      currency: initialData?.currency || 'EGP',
      openingBalance: initialData?.openingBalance,
      openingBalanceExchangeRate: initialData?.openingBalanceExchangeRate,
    },
  })

  const onFormSubmit = async (data: CreateExpenseCategorySchema) => {
    await handleFormSubmit(data, 'Failed to save expense category')
  }

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
      <Input
        label="Name"
        {...register('name')}
        placeholder="e.g., Groceries, Rent, Bills"
        error={errors.name?.message}
        required
      />

      <Textarea
        label="Description (Optional)"
        {...register('description')}
        placeholder="Add notes about this category..."
        rows={3}
      />

      <CurrencySelect
        {...register('currency', { setValueAs: emptyStringToUndefined })}
        currencies={CURRENCY_OPTIONS}
        error={errors.currency?.message}
        required
      />

      {submitError && (
        <p className="text-ios-footnote text-ios-red">{submitError}</p>
      )}

      <FormActions
        onCancel={onCancel}
        isSubmitting={isSubmitting}
        submitLabel={initialData ? 'Update' : 'Create'}
      />
    </form>
  )
}

