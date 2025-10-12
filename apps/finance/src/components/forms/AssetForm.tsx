'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Input, CurrencySelect, Textarea, FormActions } from '@repo/ui'
import { CurrencyInput } from '../shared/CurrencyInput'

import { CURRENCY_OPTIONS } from '../../utils/currencies'
import { useFormState } from '../../hooks/use-form-state'
import { createAssetAccountSchema, type CreateAssetAccountSchema } from '../../features/accounts/asset/validation'
import { emptyStringToUndefined, emptyNumberToUndefined } from '../../utils/form'

interface AssetFormProps {
  initialData?: Partial<CreateAssetAccountSchema>
  onSubmit: (data: CreateAssetAccountSchema) => Promise<void>
  onCancel: () => void
}

/**
 * Form for creating/editing assets
 */
export function AssetForm({ initialData, onSubmit, onCancel }: AssetFormProps) {
  const { submitError, handleSubmit: handleFormSubmit } = useFormState({
    onSubmit,
  })

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<CreateAssetAccountSchema>({
    resolver: zodResolver(createAssetAccountSchema),
    defaultValues: {
      name: initialData?.name || '',
      description: initialData?.description || '',
      currency: initialData?.currency || 'EGP',
      openingBalance: initialData?.openingBalance || 0,
      openingBalanceExchangeRate: initialData?.openingBalanceExchangeRate,
    },
  })

  const watchedCurrency = watch('currency')
  const watchedOpeningBalance = watch('openingBalance')

  const onFormSubmit = async (data: CreateAssetAccountSchema) => {
    await handleFormSubmit(data, 'Failed to save asset')
  }

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
      <Input
        label="Name"
        {...register('name')}
        placeholder="e.g., Cash Wallet, Bank Account"
        error={errors.name?.message}
        required
      />

      <Textarea
        label="Description (Optional)"
        {...register('description')}
        placeholder="Add notes about this asset..."
        rows={3}
      />

      <CurrencySelect
        {...register('currency', { setValueAs: emptyStringToUndefined })}
        currencies={CURRENCY_OPTIONS}
        error={errors.currency?.message}
        required
      />

      <CurrencyInput
        label="Opening Balance (Optional)"
        value={watchedOpeningBalance || 0}
        onChange={(value) => setValue('openingBalance', value, { shouldValidate: true })}
        currency={watchedCurrency}
        placeholder="0.00"
      />

      {watchedCurrency !== 'EGP' && watchedOpeningBalance && watchedOpeningBalance > 0 && (
        <Input
          type="number"
          label="Exchange Rate (Optional)"
          {...register('openingBalanceExchangeRate', { setValueAs: emptyNumberToUndefined })}
          placeholder="e.g., 50.5"
          error={errors.openingBalanceExchangeRate?.message}
          step="0.000001"
        />
      )}

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

