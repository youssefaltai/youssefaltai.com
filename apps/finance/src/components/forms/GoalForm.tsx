'use client'

import { useForm } from '@mantine/form'
import { zodResolver } from 'mantine-form-zod-resolver'
import { TextInput, Textarea, Select, NumberInput, Group, Button, Alert, Stack } from '@mantine/core'
import { DateInput } from '@mantine/dates'
import { CURRENCY_OPTIONS } from '../../utils/currencies'
import { useFormState } from '../../hooks/use-form-state'
import { createGoalSchema, type CreateGoalSchema } from '../../features/accounts/goal/validation'

interface GoalFormProps {
  initialData?: Partial<CreateGoalSchema>
  onSubmit: (data: CreateGoalSchema) => Promise<void>
  onCancel: () => void
}

/**
 * Form for creating/editing goals
 */
export function GoalForm({ initialData, onSubmit, onCancel }: GoalFormProps) {
  const { submitError, handleSubmit: handleFormSubmit, isSubmitting } = useFormState({
    onSubmit,
  })

  const form = useForm<CreateGoalSchema>({
    validate: zodResolver(createGoalSchema),
    initialValues: {
      name: initialData?.name || '',
      description: initialData?.description || '',
      currency: initialData?.currency || 'EGP',
      target: initialData?.target || 0,
      dueDate: initialData?.dueDate || new Date().toISOString(),
      openingBalance: initialData?.openingBalance || 0,
      openingBalanceExchangeRate: initialData?.openingBalanceExchangeRate,
    },
  })

  const onFormSubmit = async (data: CreateGoalSchema) => {
    await handleFormSubmit(data, 'Failed to save goal')
  }

  return (
    <form onSubmit={form.onSubmit(onFormSubmit)}>
      <Stack gap="md">
        <TextInput
          label="Goal Name"
          placeholder="e.g., Emergency Fund, Vacation"
          required
          {...form.getInputProps('name')}
        />

        <Textarea
          label="Description (Optional)"
          placeholder="What is this goal for?"
          rows={3}
          {...form.getInputProps('description')}
        />

        <Select
          label="Currency"
          data={CURRENCY_OPTIONS}
          required
          {...form.getInputProps('currency')}
        />

        {!initialData && (
          <NumberInput
            label="Current Amount (Optional)"
            placeholder="0.00"
            decimalScale={2}
            min={0}
            {...form.getInputProps('openingBalance')}
          />
        )}

        <NumberInput
          label="Target Amount"
          placeholder="0.00"
          required
          decimalScale={2}
          min={0}
          {...form.getInputProps('target')}
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
