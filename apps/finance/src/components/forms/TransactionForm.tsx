'use client'

import { useForm } from '@mantine/form'
import { zodResolver } from 'mantine-form-zod-resolver'
import { TextInput, Select, NumberInput, Group, Button, Alert, Stack } from '@mantine/core'
import { DateTimePicker } from '@mantine/dates'
import { AccountPicker } from '../shared/AccountPicker'
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
  const { submitError, handleSubmit: handleFormSubmit, isSubmitting } = useFormState({
    onSubmit,
  })

  // Fetch accounts and exchange rates for smart fallbacks
  const { data: allAccounts = [] } = useAccounts()
  const { data: exchangeRates = [] } = useExchangeRates()

  const form = useForm<CreateTransactionSchema>({
    validate: zodResolver(createTransactionSchema),
    initialValues: {
      description: initialData?.description || '',
      fromAccountId: initialData?.fromAccountId || '',
      toAccountId: initialData?.toAccountId || '',
      amount: initialData?.amount || 0,
      currency: initialData?.currency,
      exchangeRate: initialData?.exchangeRate,
      date: initialData?.date || new Date().toISOString(),
    },
  })

  const watchedFromAccountId = form.values.fromAccountId
  const watchedToAccountId = form.values.toAccountId

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

  // Currency options with empty option
  const currencyData = [
    { value: '', label: currencyPlaceholder },
    ...CURRENCY_OPTIONS
  ]

  return (
    <form onSubmit={form.onSubmit(onFormSubmit)}>
      <Stack gap="md">
        <TextInput
          label="Description"
          placeholder="e.g., Groceries, Salary"
          required
          {...form.getInputProps('description')}
        />

        <AccountPicker
          label="From"
          value={watchedFromAccountId}
          onChange={(value) => form.setFieldValue('fromAccountId', value)}
          placeholder="Select source..."
          error={form.errors.fromAccountId as string}
          excludeId={watchedToAccountId}
        />

        <AccountPicker
          label="To"
          value={watchedToAccountId}
          onChange={(value) => form.setFieldValue('toAccountId', value)}
          placeholder="Select destination..."
          error={form.errors.toAccountId as string}
          excludeId={watchedFromAccountId}
        />

        <NumberInput
          label="Amount"
          placeholder="0.00"
          required
          decimalScale={2}
          min={0}
          {...form.getInputProps('amount')}
        />

        <Select
          label="Currency (optional)"
          data={currencyData}
          placeholder={currencyPlaceholder}
          {...form.getInputProps('currency')}
          clearable
        />

        {showExchangeRate && (
          <NumberInput
            label={`Exchange Rate${storedRate ? ' (optional)' : ''}`}
            placeholder={exchangeRatePlaceholder}
            decimalScale={6}
            min={0}
            {...form.getInputProps('exchangeRate')}
          />
        )}

        <DateTimePicker
          label="Date & Time"
          placeholder="Select date and time"
          required
          value={form.values.date ? new Date(form.values.date) : new Date()}
          onChange={(value) => form.setFieldValue('date', value ? new Date(value).toISOString() : new Date().toISOString())}
        />

        {submitError && (
          <Alert color="red" title="Error">
            {submitError}
          </Alert>
        )}

        <Group justify="flex-end">
          <Button variant="default" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" loading={isSubmitting}>
            {initialData ? 'Update' : 'Create'}
          </Button>
        </Group>
      </Stack>
    </form>
  )
}
