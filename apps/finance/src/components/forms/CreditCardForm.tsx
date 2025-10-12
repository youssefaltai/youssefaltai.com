'use client'

import { useState } from 'react'
import { Input, Select, Button, Textarea } from '@repo/ui'
import { Currency } from '@repo/db'
import { CurrencyInput } from '../shared/CurrencyInput'

interface CreditCardFormData {
  name: string
  description?: string
  currency: Currency
  openingBalance?: number
  openingBalanceExchangeRate?: number
}

interface CreditCardFormProps {
  initialData?: Partial<CreditCardFormData>
  onSubmit: (data: CreditCardFormData) => Promise<void>
  onCancel: () => void
}

/**
 * Form for creating/editing credit cards
 */
export function CreditCardForm({ initialData, onSubmit, onCancel }: CreditCardFormProps) {
  const [formData, setFormData] = useState<CreditCardFormData>({
    name: initialData?.name || '',
    description: initialData?.description || '',
    currency: initialData?.currency || 'EGP',
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
      setErrors({ submit: error instanceof Error ? error.message : 'Failed to save credit card' })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Card Name"
        value={formData.name}
        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        placeholder="e.g., Visa Gold, Mastercard"
        error={errors.name}
        required
      />

      <Textarea
        label="Description (Optional)"
        value={formData.description || ''}
        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
        placeholder="Add notes about this card..."
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
        label="Current Balance"
        value={formData.openingBalance || 0}
        onChange={(value) => setFormData({ ...formData, openingBalance: value })}
        currency={formData.currency}
        placeholder="0.00"
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

