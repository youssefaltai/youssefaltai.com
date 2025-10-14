'use client'

import { useForm } from '@mantine/form'
import { zodResolver } from 'mantine-form-zod-resolver'
import { TextInput, Textarea, Select, Group, Button, Alert, Stack } from '@mantine/core'
import { CURRENCY_OPTIONS } from '../../utils/currencies'
import { useFormState } from '../../hooks/use-form-state'
import { createIncomeSourceSchema, type CreateIncomeSourceSchema } from '../../features/accounts/income/validation'

interface IncomeSourceFormProps {
  initialData?: Partial<CreateIncomeSourceSchema>
  onSubmit: (data: CreateIncomeSourceSchema) => Promise<void>
  onCancel: () => void
}

/**
 * Form for creating/editing income sources
 */
export function IncomeSourceForm({ initialData, onSubmit, onCancel }: IncomeSourceFormProps) {
  const { submitError, handleSubmit: handleFormSubmit, isSubmitting } = useFormState({
    onSubmit,
  })

  const form = useForm<CreateIncomeSourceSchema>({
    validate: zodResolver(createIncomeSourceSchema),
    initialValues: {
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
    <form onSubmit={form.onSubmit(onFormSubmit)}>
      <Stack gap="md">
        <TextInput
          label="Name"
          placeholder="e.g., Salary, Freelance"
          required
          {...form.getInputProps('name')}
        />

        <Textarea
          label="Description (Optional)"
          placeholder="Add notes about this income source..."
          rows={3}
          {...form.getInputProps('description')}
        />

        <Select
          label="Currency"
          data={CURRENCY_OPTIONS}
          required
          {...form.getInputProps('currency')}
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
