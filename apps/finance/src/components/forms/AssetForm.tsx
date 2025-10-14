'use client'

import { useForm } from '@mantine/form'
import { zodResolver } from 'mantine-form-zod-resolver'
import { TextInput, Textarea, Select, NumberInput, Group, Button, Alert, Stack } from '@mantine/core'
import { CurrencyInput } from '../shared/CurrencyInput'
import { CURRENCY_OPTIONS } from '../../utils/currencies'
import { useFormState } from '../../hooks/use-form-state'
import { createAssetAccountSchema, type CreateAssetAccountSchema } from '../../features/accounts/asset/validation'

interface AssetFormProps {
  initialData?: Partial<CreateAssetAccountSchema>
  onSubmit: (data: CreateAssetAccountSchema) => Promise<void>
  onCancel: () => void
}

/**
 * Form for creating/editing assets
 */
export function AssetForm({ initialData, onSubmit, onCancel }: AssetFormProps) {
  const { submitError, handleSubmit: handleFormSubmit, isSubmitting } = useFormState({
    onSubmit,
  })

  const form = useForm<CreateAssetAccountSchema>({
    validate: zodResolver(createAssetAccountSchema),
    initialValues: {
      name: initialData?.name || '',
      description: initialData?.description || '',
      currency: initialData?.currency || 'EGP',
      openingBalance: initialData?.openingBalance || 0,
      openingBalanceExchangeRate: initialData?.openingBalanceExchangeRate,
    },
  })

  const watchedCurrency = form.values.currency
  const watchedOpeningBalance = form.values.openingBalance

  const onFormSubmit = async (data: CreateAssetAccountSchema) => {
    await handleFormSubmit(data, 'Failed to save asset')
  }

  return (
    <form onSubmit={form.onSubmit(onFormSubmit)}>
      <Stack gap="md">
        <TextInput
          label="Name"
          placeholder="e.g., Cash Wallet, Bank Account"
          required
          {...form.getInputProps('name')}
        />

        <Textarea
          label="Description (Optional)"
          placeholder="Add notes about this asset..."
          rows={3}
          {...form.getInputProps('description')}
        />

        <Select
          label="Currency"
          data={CURRENCY_OPTIONS}
          required
          {...form.getInputProps('currency')}
        />

        <CurrencyInput
          label="Opening Balance (Optional)"
          value={watchedOpeningBalance || 0}
          onChange={(value) => form.setFieldValue('openingBalance', value)}
          currency={watchedCurrency}
          placeholder="0.00"
        />

        {watchedCurrency !== 'EGP' && watchedOpeningBalance && watchedOpeningBalance > 0 && (
          <NumberInput
            label="Exchange Rate (Optional)"
            placeholder="e.g., 50.5"
            decimalScale={6}
            {...form.getInputProps('openingBalanceExchangeRate')}
          />
        )}

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
