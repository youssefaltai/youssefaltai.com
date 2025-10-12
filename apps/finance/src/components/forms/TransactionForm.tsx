'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Input, CurrencySelect } from '@repo/ui'
import { AccountPicker } from '../shared/AccountPicker'
import { FormActions } from '@repo/ui'
import { emptyStringToUndefined, emptyNumberToUndefined } from '../../utils/form'
import { parseISO, format } from '@repo/utils'
import { CURRENCY_OPTIONS } from '../../utils/currencies'
import { useFormState } from '../../hooks/use-form-state'
import { useAccounts } from '../../hooks/use-accounts'
import { useExchangeRates } from '../../hooks/use-exchange-rates'
import { createTransactionSchema, type CreateTransactionSchema } from '../../features/transactions/validation'

interface TransactionFormProps {
  initialData?: Partial<CreateTransactionSchema>
  onSubmit: (data: CreateTransactionSchema) => Promise<void>
  onCancel: () => void
}

/**
 * Form for creating/editing transactions
 */
export function TransactionForm({ initialData, onSubmit, onCancel }: TransactionFormProps) {
  const { submitError, handleSubmit: handleFormSubmit } = useFormState({
    onSubmit,
  })

  // Fetch accounts and exchange rates for smart fallbacks
  const { data: allAccounts = [] } = useAccounts()
  const { data: exchangeRates = [] } = useExchangeRates()

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<CreateTransactionSchema>({
    resolver: zodResolver(createTransactionSchema),
    defaultValues: {
      description: initialData?.description || '',
      fromAccountId: initialData?.fromAccountId || '',
      toAccountId: initialData?.toAccountId || '',
      amount: initialData?.amount || 0,
      currency: initialData?.currency,
      exchangeRate: initialData?.exchangeRate,
      date: initialData?.date || new Date().toISOString(),
    },
  })

  const watchedDate = watch('date')
  const watchedFromAccountId = watch('fromAccountId')
  const watchedToAccountId = watch('toAccountId')

  // Derive account objects from selected IDs
  const fromAccount = allAccounts.find(a => a.id === watchedFromAccountId)
  const toAccount = allAccounts.find(a => a.id === watchedToAccountId)

  // Determine if this is a cross-currency transaction
  const isCrossCurrency = fromAccount && toAccount && fromAccount.currency !== toAccount.currency

  // Find stored exchange rate for this currency pair
  const storedRate = isCrossCurrency ? exchangeRates.find(rate =>
    (rate.fromCurrency === fromAccount.currency && rate.toCurrency === toAccount.currency) ||
    (rate.fromCurrency === toAccount.currency && rate.toCurrency === fromAccount.currency)
  ) : null

  // Generate dynamic placeholders
  const currencyPlaceholder = fromAccount
    ? `Will use ${fromAccount.currency} if empty`
    : 'Select accounts first...'

  const exchangeRatePlaceholder = storedRate
    ? `Will use stored rate: ${Number(storedRate.rate).toFixed(6)}`
    : 'No stored rate - required'

  // Show exchange rate field for cross-currency transactions
  const showExchangeRate = Boolean(isCrossCurrency)

  const onFormSubmit = async (data: CreateTransactionSchema) => {
    await handleFormSubmit(data, 'Failed to save transaction')
  }


  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
      {/* Hidden field to hold the actual date value (ISO string) */}
      <input type="hidden" {...register('date')} />

      <Input
        label="Description"
        {...register('description')}
        placeholder="e.g., Groceries, Salary"
        error={errors.description?.message}
        required
      />

      <AccountPicker
        label="From"
        value={watchedFromAccountId}
        onChange={(value) => setValue('fromAccountId', value, { shouldValidate: true })}
        placeholder="Select source..."
        error={errors.fromAccountId?.message}
        excludeId={watchedToAccountId}
      />

      <AccountPicker
        label="To"
        value={watchedToAccountId}
        onChange={(value) => setValue('toAccountId', value, { shouldValidate: true })}
        placeholder="Select destination..."
        error={errors.toAccountId?.message}
        excludeId={watchedFromAccountId}
      />

      <Input
        type="number"
        label="Amount"
        {...register('amount', { valueAsNumber: true })}
        placeholder="0.00"
        error={errors.amount?.message}
        step="0.01"
        min="0"
        required
      />

      <CurrencySelect
        label="Currency (optional)"
        {...register('currency', { setValueAs: emptyStringToUndefined })}
        currencies={CURRENCY_OPTIONS}
        error={errors.currency?.message}
        includeEmpty={true}
        emptyLabel={currencyPlaceholder}
      />

      {showExchangeRate && (
        <Input
          type="number"
          label={`Exchange Rate${storedRate ? ' (optional)' : ''}`}
          {...register('exchangeRate', { setValueAs: emptyNumberToUndefined })}
          placeholder={exchangeRatePlaceholder}
          error={errors.exchangeRate?.message}
          step="0.000001"
          min="0"
          required={!storedRate}
        />
      )}

      <div className="grid grid-cols-2 gap-3">
        <Input
          type="date"
          label="Date"
          value={format(parseISO(watchedDate), 'yyyy-MM-dd')}
          onChange={(e) => {
            const currentTime = format(parseISO(watchedDate), 'HH:mm')
            const newIso = parseISO(`${e.target.value}T${currentTime}`).toISOString()
            setValue('date', newIso, { shouldValidate: true })
          }}
          error={errors.date?.message}
          required
        />
        <Input
          type="time"
          label="Time"
          value={format(parseISO(watchedDate), 'HH:mm')}
          onChange={(e) => {
            const currentDate = format(parseISO(watchedDate), 'yyyy-MM-dd')
            const newIso = parseISO(`${currentDate}T${e.target.value}`).toISOString()
            setValue('date', newIso, { shouldValidate: true })
          }}
          error={errors.date?.message}
          required
        />
      </div>

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

