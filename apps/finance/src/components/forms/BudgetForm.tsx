'use client'

import { useState, useEffect } from 'react'
import { useForm } from '@mantine/form'
import { zodResolver } from 'mantine-form-zod-resolver'
import { TextInput, Select, NumberInput, Group, Button, Alert, Stack, Text, Chip } from '@mantine/core'
import { DateInput } from '@mantine/dates'
import { CURRENCY_OPTIONS } from '../../utils/currencies'
import { useFormState } from '../../hooks/use-form-state'
import { createBudgetSchema, type CreateBudgetSchema } from '../../features/budgets/validation'
import { useExpenseCategories } from '../../hooks/use-expense-categories'
import { startOfMonth, endOfMonth, addMonths, startOfQuarter, endOfQuarter } from '@repo/utils'

interface BudgetFormProps {
  initialData?: Partial<CreateBudgetSchema> & { id?: string }
  onSubmit: (data: CreateBudgetSchema) => Promise<void>
  onCancel: () => void
}

type DatePreset = 'this-month' | 'next-month' | 'this-quarter' | 'custom'

/**
 * Form for creating/editing budgets
 */
export function BudgetForm({ initialData, onSubmit, onCancel }: BudgetFormProps) {
  const { submitError, handleSubmit: handleFormSubmit, isSubmitting } = useFormState({
    onSubmit,
  })

  const { data: expenseCategories = [], isLoading: isLoadingCategories } = useExpenseCategories()

  const [datePreset, setDatePreset] = useState<DatePreset>('this-month')

  const form = useForm<CreateBudgetSchema>({
    validate: zodResolver(createBudgetSchema),
    initialValues: {
      name: initialData?.name || '',
      amount: initialData?.amount || 0,
      currency: initialData?.currency || 'EGP',
      startDate: initialData?.startDate || startOfMonth(new Date()).toISOString(),
      endDate: initialData?.endDate || endOfMonth(new Date()).toISOString(),
      accountIds: initialData?.accountIds || [],
    },
  })

  // Apply date preset when changed
  useEffect(() => {
    if (datePreset === 'custom') return

    const now = new Date()
    let start: Date
    let end: Date

    switch (datePreset) {
      case 'this-month':
        start = startOfMonth(now)
        end = endOfMonth(now)
        break
      case 'next-month':
        start = startOfMonth(addMonths(now, 1))
        end = endOfMonth(addMonths(now, 1))
        break
      case 'this-quarter':
        start = startOfQuarter(now)
        end = endOfQuarter(now)
        break
      default:
        return
    }

    form.setFieldValue('startDate', start.toISOString())
    form.setFieldValue('endDate', end.toISOString())
  }, [datePreset])

  const onFormSubmit = async (data: CreateBudgetSchema) => {
    await handleFormSubmit(data, 'Failed to save budget')
  }

  return (
    <form onSubmit={form.onSubmit(onFormSubmit)}>
      <Stack gap="md">
        <TextInput
          label="Budget Name"
          placeholder="e.g., Monthly Groceries, Entertainment"
          required
          {...form.getInputProps('name')}
        />

        <NumberInput
          label="Budget Amount"
          placeholder="0.00"
          required
          decimalScale={2}
          min={0}
          {...form.getInputProps('amount')}
        />

        <Select
          label="Currency"
          data={CURRENCY_OPTIONS}
          required
          {...form.getInputProps('currency')}
        />

        {/* Date Preset Selector */}
        <Select
          label="Budget Period"
          value={datePreset}
          onChange={(value) => setDatePreset(value as DatePreset)}
          data={[
            { value: 'this-month', label: 'This Month' },
            { value: 'next-month', label: 'Next Month' },
            { value: 'this-quarter', label: 'This Quarter' },
            { value: 'custom', label: 'Custom' },
          ]}
        />

        {/* Custom Date Inputs (only visible when custom is selected) */}
        {datePreset === 'custom' && (
          <>
            <DateInput
              label="Start Date"
              required
              value={form.values.startDate ? new Date(form.values.startDate) : new Date()}
              onChange={(value) => form.setFieldValue('startDate', value ? new Date(value).toISOString() : new Date().toISOString())}
            />

            <DateInput
              label="End Date"
              required
              value={form.values.endDate ? new Date(form.values.endDate) : new Date()}
              onChange={(value) => form.setFieldValue('endDate', value ? new Date(value).toISOString() : new Date().toISOString())}
            />
          </>
        )}

        {/* Expense Categories Multi-Select */}
        {isLoadingCategories ? (
          <div>
            <Text fw={500} size="sm" mb="xs">Expense Categories *</Text>
            <Text size="xs" c="dimmed">Loading categories...</Text>
          </div>
        ) : (
          <div>
            <Text fw={500} size="sm" mb="xs">Expense Categories *</Text>
            {expenseCategories.length === 0 ? (
              <Text size="sm" c="dimmed">No expense categories found. Create some first.</Text>
            ) : (
              <Chip.Group multiple value={form.values.accountIds || []} onChange={(value) => form.setFieldValue('accountIds', value)}>
                <Group gap="xs">
                  {expenseCategories.map((category) => (
                    <Chip key={category.id} value={category.id}>{category.name}</Chip>
                  ))}
                </Group>
              </Chip.Group>
            )}
            {form.errors.accountIds && (
              <Text size="xs" c="red" mt={4}>{form.errors.accountIds as string}</Text>
            )}
          </div>
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
            {initialData?.id ? 'Update' : 'Create'}
          </Button>
        </Group>
      </Stack>
    </form>
  )
}
