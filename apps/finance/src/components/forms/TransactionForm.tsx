'use client'

import { useState } from 'react'
import { Input, Select, Button, Textarea } from '@repo/ui'
import { Currency } from '@repo/db'
import { CurrencyInput } from '../shared/CurrencyInput'
import { AccountPicker } from '../shared/AccountPicker'
import { isoToDateInput, isoToTimeInput, dateInputToISO } from '../../utils/format'

interface TransactionFormData {
  description: string
  fromAccountId: string
  toAccountId: string
  amount: number
  currency?: Currency
  exchangeRate?: number
  date: string
}

interface TransactionFormProps {
  initialData?: Partial<TransactionFormData>
  onSubmit: (data: TransactionFormData) => Promise<void>
  onCancel: () => void
}

/**
 * Form for creating/editing transactions
 */
export function TransactionForm({ initialData, onSubmit, onCancel }: TransactionFormProps) {
  const [formData, setFormData] = useState<TransactionFormData>({
    description: initialData?.description || '',
    fromAccountId: initialData?.fromAccountId || '',
    toAccountId: initialData?.toAccountId || '',
    amount: initialData?.amount || 0,
    currency: initialData?.currency,
    exchangeRate: initialData?.exchangeRate,
    date: initialData?.date || new Date().toISOString(),
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required'
    }

    if (!formData.fromAccountId) {
      newErrors.fromAccountId = 'From account is required'
    }

    if (!formData.toAccountId) {
      newErrors.toAccountId = 'To account is required'
    }

    if (formData.fromAccountId === formData.toAccountId) {
      newErrors.toAccountId = 'From and to accounts must be different'
    }

    if (!formData.amount || formData.amount <= 0) {
      newErrors.amount = 'Amount must be greater than 0'
    }

    if (formData.exchangeRate && !formData.currency) {
      newErrors.currency = 'Currency is required when exchange rate is provided'
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
      setErrors({ submit: error instanceof Error ? error.message : 'Failed to save transaction' })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDateTimeChange = (dateString: string, timeString: string) => {
    const isoDate = dateInputToISO(dateString, timeString)
    setFormData({ ...formData, date: isoDate })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Description"
        value={formData.description}
        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
        placeholder="e.g., Groceries, Salary"
        error={errors.description}
        required
      />

      <AccountPicker
        label="From"
        value={formData.fromAccountId}
        onChange={(value) => setFormData({ ...formData, fromAccountId: value })}
        placeholder="Select source..."
        error={errors.fromAccountId}
        excludeId={formData.toAccountId}
      />

      <AccountPicker
        label="To"
        value={formData.toAccountId}
        onChange={(value) => setFormData({ ...formData, toAccountId: value })}
        placeholder="Select destination..."
        error={errors.toAccountId}
        excludeId={formData.fromAccountId}
      />

      <div>
        <label className="text-ios-footnote text-ios-gray-1 block mb-1">
          Amount
        </label>
        <Input
          type="number"
          value={formData.amount || ''}
          onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
          placeholder="0.00"
          error={errors.amount}
          step="0.01"
          min="0"
          required
        />
        {errors.amount && (
          <p className="text-ios-footnote text-ios-red mt-1">{errors.amount}</p>
        )}
      </div>

      <Select
        label="Currency (Optional)"
        value={formData.currency || ''}
        onChange={(e) => setFormData({ ...formData, currency: e.target.value as Currency || undefined })}
        error={errors.currency}
      >
        <option value="">Same as accounts</option>
        <option value="EGP">Egyptian Pound (EGP)</option>
        <option value="USD">US Dollar (USD)</option>
        <option value="GOLD">Gold (grams)</option>
      </Select>

      {formData.currency && (
        <Input
          type="number"
          label="Exchange Rate (Optional)"
          value={formData.exchangeRate || ''}
          onChange={(e) => setFormData({
            ...formData,
            exchangeRate: e.target.value ? parseFloat(e.target.value) : undefined
          })}
          placeholder="e.g., 50.5"
          step="0.000001"
        />
      )}

      <div className="grid grid-cols-2 gap-3">
        <Input
          type="date"
          label="Date"
          value={isoToDateInput(formData.date)}
          onChange={(e) => handleDateTimeChange(e.target.value, isoToTimeInput(formData.date))}
          required
        />
        <Input
          type="time"
          label="Time"
          value={isoToTimeInput(formData.date)}
          onChange={(e) => handleDateTimeChange(isoToDateInput(formData.date), e.target.value)}
          required
        />
      </div>

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

