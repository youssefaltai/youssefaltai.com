'use client'

import { useState } from 'react'
import { Input, Select, Button, Textarea } from '@repo/ui'
import { Currency } from '@repo/db'
import { CurrencyInput } from '../shared/CurrencyInput'
import { isoToDateInput, dateInputToISO } from '../../utils/format'

interface GoalFormData {
  name: string
  description?: string
  currency: Currency
  target: number
  dueDate?: string
  openingBalance?: number
  openingBalanceExchangeRate?: number
}

interface GoalFormProps {
  initialData?: Partial<GoalFormData>
  onSubmit: (data: GoalFormData) => Promise<void>
  onCancel: () => void
}

/**
 * Form for creating/editing goals
 */
export function GoalForm({ initialData, onSubmit, onCancel }: GoalFormProps) {
  const [formData, setFormData] = useState<GoalFormData>({
    name: initialData?.name || '',
    description: initialData?.description || '',
    currency: initialData?.currency || 'EGP',
    target: initialData?.target || 0,
    dueDate: initialData?.dueDate,
    openingBalance: initialData?.openingBalance || 0,
    openingBalanceExchangeRate: initialData?.openingBalanceExchangeRate,
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required'
    }

    if (!formData.target || formData.target <= 0) {
      newErrors.target = 'Target amount must be greater than 0'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validate()) return

    setIsSubmitting(true)
    try {
      await onSubmit(formData)
    } catch (error) {
      setErrors({ submit: error instanceof Error ? error.message : 'Failed to save goal' })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Goal Name"
        value={formData.name}
        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        placeholder="e.g., Emergency Fund, Vacation"
        error={errors.name}
        required
      />

      <Textarea
        label="Description (Optional)"
        value={formData.description || ''}
        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
        placeholder="What is this goal for?"
        rows={3}
      />

      <Select
        label="Currency"
        value={formData.currency}
        onChange={(e) => setFormData({ ...formData, currency: e.target.value as Currency })}
        required
      >
        <option value="EGP">Egyptian Pound (EGP)</option>
        <option value="USD">US Dollar (USD)</option>
        <option value="GOLD">Gold (grams)</option>
      </Select>

      <CurrencyInput
        label="Target Amount"
        value={formData.target}
        onChange={(value) => setFormData({ ...formData, target: value })}
        currency={formData.currency}
        placeholder="0.00"
        error={errors.target}
      />

      <CurrencyInput
        label="Current Amount (Optional)"
        value={formData.openingBalance || 0}
        onChange={(value) => setFormData({ ...formData, openingBalance: value })}
        currency={formData.currency}
        placeholder="0.00"
      />

      <Input
        type="date"
        label="Due Date (Optional)"
        value={formData.dueDate ? isoToDateInput(formData.dueDate) : ''}
        onChange={(e) => setFormData({
          ...formData,
          dueDate: e.target.value ? dateInputToISO(e.target.value) : undefined
        })}
      />

      {errors.submit && (
        <p className="text-ios-footnote text-ios-red">{errors.submit}</p>
      )}

      <div className="flex gap-3 pt-2">
        <Button
          type="button"
          variant="secondary"
          onClick={onCancel}
          disabled={isSubmitting}
          className="flex-1"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          variant="primary"
          disabled={isSubmitting}
          className="flex-1"
        >
          {isSubmitting ? 'Saving...' : initialData ? 'Update' : 'Create'}
        </Button>
      </div>
    </form>
  )
}

