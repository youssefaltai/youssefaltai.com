'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Input, CurrencySelect, Textarea } from '@repo/ui'
import { FormActions } from '@repo/ui'
import { CURRENCY_OPTIONS } from '../../utils/currencies'
import { useFormState } from '../../hooks/use-form-state'
import { createGoalSchema, type CreateGoalSchema } from '../../features/accounts/goal/validation'
import { emptyNumberToUndefined, emptyStringToUndefined } from '../../utils/form'
import { parseISO, format } from '@repo/utils'

interface GoalFormProps {
  initialData?: Partial<CreateGoalSchema>
  onSubmit: (data: CreateGoalSchema) => Promise<void>
  onCancel: () => void
}

/**
 * Form for creating/editing goals
 */
export function GoalForm({ initialData, onSubmit, onCancel }: GoalFormProps) {
  const { submitError, handleSubmit: handleFormSubmit } = useFormState({
    onSubmit,
  })

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CreateGoalSchema>({
    resolver: zodResolver(createGoalSchema),
    defaultValues: {
      name: initialData?.name || '',
      description: initialData?.description || '',
      currency: initialData?.currency || 'EGP',
      target: initialData?.target || 0,
      dueDate: initialData?.dueDate ? format(parseISO(initialData.dueDate), 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd'),
      openingBalance: initialData?.openingBalance || 0,
      openingBalanceExchangeRate: initialData?.openingBalanceExchangeRate,
    },
  })

  const onFormSubmit = async (data: CreateGoalSchema) => {
    await handleFormSubmit(data, 'Failed to save goal')
  }

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
      <Input
        label="Goal Name"
        {...register('name')}
        placeholder="e.g., Emergency Fund, Vacation"
        error={errors.name?.message}
        required
      />

      <Textarea
        label="Description (Optional)"
        {...register('description')}
        placeholder="What is this goal for?"
        rows={3}
      />

      <CurrencySelect
        {...register('currency', { setValueAs: emptyStringToUndefined })}
        currencies={CURRENCY_OPTIONS}
        error={errors.currency?.message}
        required
      />

      {!initialData && (
        <Input
          type="number"
          label="Current Amount (Optional)"
          {...register('openingBalance', { setValueAs: emptyNumberToUndefined })}
          error={errors.openingBalance?.message}
          placeholder="0.00"
          step="0.01"
          min="0"
        />
      )}

      <Input
        type="number"
        label="Target Amount"
        {...register('target', { setValueAs: emptyNumberToUndefined })}
        error={errors.target?.message}
        placeholder="0.00"
        step="0.01"
        min="0"
        required
      />

      <Input
        type="date"
        label="Due Date"
        {...register('dueDate', { setValueAs: (v) => v ? parseISO(v + 'T12:00:00').toISOString() : new Date().toISOString() })}
        error={errors.dueDate?.message}
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

