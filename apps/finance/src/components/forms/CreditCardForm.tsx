'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Input, CurrencySelect, Textarea } from '@repo/ui'
import { FormActions } from '@repo/ui'
import { CURRENCY_OPTIONS } from '../../utils/currencies'
import { useFormState } from '../../hooks/use-form-state'
import { createCreditCardSchema, type CreateCreditCardSchema } from '../../features/accounts/credit-card/validation'
import { emptyNumberToUndefined, emptyStringToUndefined } from '../../utils/form'

interface CreditCardFormProps {
  initialData?: Partial<CreateCreditCardSchema>
  onSubmit: (data: CreateCreditCardSchema) => Promise<void>
  onCancel: () => void
}

/**
 * Form for creating/editing credit cards
 */
export function CreditCardForm({ initialData, onSubmit, onCancel }: CreditCardFormProps) {
  const { submitError, handleSubmit: handleFormSubmit } = useFormState({
    onSubmit,
  })

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CreateCreditCardSchema>({
    resolver: zodResolver(createCreditCardSchema),
    defaultValues: {
      name: initialData?.name || '',
      description: initialData?.description || '',
      currency: initialData?.currency || 'EGP',
      openingBalance: initialData?.openingBalance || 0,
      openingBalanceExchangeRate: initialData?.openingBalanceExchangeRate,
    },
  })


  const onFormSubmit = async (data: CreateCreditCardSchema) => {
    await handleFormSubmit(data, 'Failed to save credit card')
  }

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
      <Input
        label="Card Name"
        {...register('name')}
        placeholder="e.g., Visa Gold, Mastercard"
        error={errors.name?.message}
        required
      />

      <Textarea
        label="Description (Optional)"
        {...register('description')}
        placeholder="Add notes about this card..."
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
        label="Opening Balance"
        {...register('openingBalance', { setValueAs: emptyNumberToUndefined })}
        placeholder="0.00"
        error={errors.openingBalance?.message}
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

