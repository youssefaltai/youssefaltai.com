'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Input, CurrencySelect, Textarea } from '@repo/ui'
import { FormActions } from '@repo/ui'
import { CURRENCY_OPTIONS } from '../../utils/currencies'
import { useFormState } from '../../hooks/use-form-state'
import { createLoanSchema, type CreateLoanSchema } from '../../features/accounts/loan/validation'
import { emptyNumberToUndefined, emptyStringToUndefined } from '../../utils/form'
import { parseISO, format } from '@repo/utils'

interface LoanFormProps {
  initialData?: Partial<CreateLoanSchema>
  onSubmit: (data: CreateLoanSchema) => Promise<void>
  onCancel: () => void
}

/**
 * Form for creating/editing loans
 */
export function LoanForm({ initialData, onSubmit, onCancel }: LoanFormProps) {
  const { submitError, handleSubmit: handleFormSubmit } = useFormState({
    onSubmit,
  })

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CreateLoanSchema>({
    resolver: zodResolver(createLoanSchema),
    defaultValues: {
      name: initialData?.name || '',
      description: initialData?.description || '',
      currency: initialData?.currency || 'EGP',
      dueDate: initialData?.dueDate ? format(parseISO(initialData.dueDate), 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd'),
      openingBalance: initialData?.openingBalance || 0,
      openingBalanceExchangeRate: initialData?.openingBalanceExchangeRate,
    },
  })

  const onFormSubmit = async (data: CreateLoanSchema) => {
    await handleFormSubmit(data, 'Failed to save loan')
  }

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
      <Input
        label="Loan Name"
        {...register('name')}
        placeholder="e.g., Car Loan, Personal Loan"
        error={errors.name?.message}
        required
      />

      <Textarea
        label="Description (Optional)"
        {...register('description')}
        placeholder="Add notes about this loan..."
        rows={3}
      />

      <CurrencySelect
        {...register('currency', { setValueAs: emptyStringToUndefined })}
        currencies={CURRENCY_OPTIONS}
        error={errors.currency?.message}
        required
      />

      <Input
        type="number"
        label="Amount Owed"
        {...register('openingBalance', { setValueAs: emptyNumberToUndefined })}
        error={errors.openingBalance?.message}
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

