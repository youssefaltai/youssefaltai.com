'use client'

import { useForm } from '@mantine/form'
import { zodResolver } from 'mantine-form-zod-resolver'
import { TextInput, Textarea, Select, Group, Button, Alert, Stack } from '@mantine/core'
import { CURRENCY_OPTIONS } from '../../utils/currencies'
import { useFormState } from '../../hooks/use-form-state'
import { createExpenseCategorySchema, type CreateExpenseCategorySchema } from '../../features/accounts/expense/validation'

interface ExpenseCategoryFormProps {
  initialData?: Partial<CreateExpenseCategorySchema>
  onSubmit: (data: CreateExpenseCategorySchema) => Promise<void>
  onCancel: () => void
}

/**
 * Form for creating/editing expense categories
 */
export function ExpenseCategoryForm({ initialData, onSubmit, onCancel }: ExpenseCategoryFormProps) {
  const { submitError, handleSubmit: handleFormSubmit, isSubmitting } = useFormState({
    onSubmit,
  })

  const form = useForm<CreateExpenseCategorySchema>({
    validate: zodResolver(createExpenseCategorySchema),
    initialValues: {
      name: initialData?.name || '',
      description: initialData?.description || '',
      currency: initialData?.currency || 'EGP',
      openingBalance: initialData?.openingBalance,
      openingBalanceExchangeRate: initialData?.openingBalanceExchangeRate,
    },
  })

  const onFormSubmit = async (data: CreateExpenseCategorySchema) => {
    await handleFormSubmit(data, 'Failed to save expense category')
  }

  return (
    <form onSubmit={form.onSubmit(onFormSubmit)}>
      <Stack gap="md">
        <TextInput
          label="Name"
          placeholder="e.g., Groceries, Rent, Bills"
          required
          {...form.getInputProps('name')}
        />

        <Textarea
          label="Description (Optional)"
          placeholder="Add notes about this category..."
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

