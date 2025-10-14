'use client'

import { useForm } from '@mantine/form'
import { zodResolver } from 'mantine-form-zod-resolver'
import { TextInput, Textarea, Select, NumberInput, Group, Button, Alert, Stack } from '@mantine/core'
import { DateInput } from '@mantine/dates'
import { CURRENCY_OPTIONS } from '../../utils/currencies'
import { useFormState } from '../../hooks/use-form-state'
import { createLoanSchema, type CreateLoanSchema } from '../../features/accounts/loan/validation'

interface LoanFormProps {
  initialData?: Partial<CreateLoanSchema>
  onSubmit: (data: CreateLoanSchema) => Promise<void>
  onCancel: () => void
}

/**
 * Form for creating/editing loans
 */
export function LoanForm({ initialData, onSubmit, onCancel }: LoanFormProps) {
  const { submitError, handleSubmit: handleFormSubmit, isSubmitting } = useFormState({
    onSubmit,
  })

  const form = useForm<CreateLoanSchema>({
    validate: zodResolver(createLoanSchema),
    initialValues: {
      name: initialData?.name || '',
      description: initialData?.description || '',
      currency: initialData?.currency || 'EGP',
      dueDate: initialData?.dueDate || new Date().toISOString(),
      openingBalance: initialData?.openingBalance || 0,
      openingBalanceExchangeRate: initialData?.openingBalanceExchangeRate,
    },
  })

  const onFormSubmit = async (data: CreateLoanSchema) => {
    await handleFormSubmit(data, 'Failed to save loan')
  }

  return (
    <form onSubmit={form.onSubmit(onFormSubmit)}>
      <Stack gap="md">
        <TextInput
          label="Loan Name"
          placeholder="e.g., Car Loan, Personal Loan"
          required
          {...form.getInputProps('name')}
        />

        <Textarea
          label="Description (Optional)"
          placeholder="Add notes about this loan..."
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
          label="Amount Owed"
          placeholder="0.00"
          required
          decimalScale={2}
          min={0}
          {...form.getInputProps('openingBalance')}
        />

        <DateInput
          label="Due Date"
          placeholder="Select date"
          required
          value={form.values.dueDate ? new Date(form.values.dueDate) : new Date()}
          onChange={(value) => form.setFieldValue('dueDate', value ? new Date(value).toISOString() : new Date().toISOString())}
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
