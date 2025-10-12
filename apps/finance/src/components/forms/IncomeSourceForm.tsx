'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Input, CurrencySelect, Textarea } from '@repo/ui'
import { FormActions } from '@repo/ui'

import { CURRENCY_OPTIONS } from '../../utils/currencies'
import { useFormState } from '../../hooks/use-form-state'
import { createIncomeSourceSchema, type CreateIncomeSourceSchema } from '../../features/accounts/income/validation'
import { emptyStringToUndefined } from '@/utils/form'

interface IncomeSourceFormProps {
  initialData?: Partial<CreateIncomeSourceSchema>
  onSubmit: (data: CreateIncomeSourceSchema) => Promise<void>
  onCancel: () => void
}

/**
 * Form for creating/editing income sources
 */
export function IncomeSourceForm({ initialData, onSubmit, onCancel }: IncomeSourceFormProps) {
  const { submitError, handleSubmit: handleFormSubmit } = useFormState({
    onSubmit,
  })

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CreateIncomeSourceSchema>({
    resolver: zodResolver(createIncomeSourceSchema),
    defaultValues: {
      name: initialData?.name || '',
      description: initialData?.description || '',
      currency: initialData?.currency || 'EGP',
      openingBalance: initialData?.openingBalance,
      openingBalanceExchangeRate: initialData?.openingBalanceExchangeRate,
    },
  })

  const onFormSubmit = async (data: CreateIncomeSourceSchema) => {
    await handleFormSubmit(data, 'Failed to save income source')
  }

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
      <Input
        label="Name"
        {...register('name')}
        placeholder="e.g., Salary, Freelance"
        error={errors.name?.message}
        required
      />

      <Textarea
        label="Description (Optional)"
        {...register('description')}
        placeholder="Add notes about this income source..."
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

