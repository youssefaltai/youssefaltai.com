'use client'

import { useState } from 'react'
import { Input, Select, Button, Textarea } from '@repo/ui'
import { Currency } from '@repo/db'

interface ExpenseCategoryFormData {
  name: string
  description?: string
  currency: Currency
  openingBalance?: number
  openingBalanceExchangeRate?: number
}

interface ExpenseCategoryFormProps {
  initialData?: Partial<ExpenseCategoryFormData>
  onSubmit: (data: ExpenseCategoryFormData) => Promise<void>
  onCancel: () => void
}

/**
 * Form for creating/editing expense categories
 */
export function ExpenseCategoryForm({ initialData, onSubmit, onCancel }: ExpenseCategoryFormProps) {
  const [formData, setFormData] = useState<ExpenseCategoryFormData>({
    name: initialData?.name || '',
    description: initialData?.description || '',
    currency: initialData?.currency || 'EGP',
    openingBalance: initialData?.openingBalance,
    openingBalanceExchangeRate: initialData?.openingBalanceExchangeRate,
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required'
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
      setErrors({ submit: error instanceof Error ? error.message : 'Failed to save expense category' })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Name"
        value={formData.name}
        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        placeholder="e.g., Groceries, Rent, Bills"
        error={errors.name}
        required
      />

      <Textarea
        label="Description (Optional)"
        value={formData.description || ''}
        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
        placeholder="Add notes about this category..."
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

