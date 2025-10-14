'use client'

import { useForm } from '@mantine/form'
import { zodResolver } from 'mantine-form-zod-resolver'
import { TextInput, Textarea, Select, NumberInput, Group, Button, Alert, Stack } from '@mantine/core'
import { CURRENCY_OPTIONS } from '../../utils/currencies'
import { useFormState } from '../../hooks/use-form-state'
import { createCreditCardSchema, type CreateCreditCardSchema } from '../../features/accounts/credit-card/validation'

interface CreditCardFormProps {
  initialData?: Partial<CreateCreditCardSchema>
  onSubmit: (data: CreateCreditCardSchema) => Promise<void>
  onCancel: () => void
}

/**
 * Form for creating/editing credit cards
 */
export function CreditCardForm({ initialData, onSubmit, onCancel }: CreditCardFormProps) {
  const { submitError, handleSubmit: handleFormSubmit, isSubmitting } = useFormState({
    onSubmit,
  })

  const form = useForm<CreateCreditCardSchema>({
    validate: zodResolver(createCreditCardSchema),
    initialValues: {
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
    <form onSubmit={form.onSubmit(onFormSubmit)}>
      <Stack gap="md">
        <TextInput
          label="Card Name"
          placeholder="e.g., Visa Gold, Mastercard"
          required
          {...form.getInputProps('name')}
        />

        <Textarea
          label="Description (Optional)"
          placeholder="Add notes about this card..."
          rows={3}
          {...form.getInputProps('description')}
        />

        <Select
          label="Currency"
          data={CURRENCY_OPTIONS}
          required
          {...form.getInputProps('currency')}
        />

        <NumberInput
          label="Opening Balance"
          placeholder="0.00"
          required
          decimalScale={2}
          {...form.getInputProps('openingBalance')}
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
