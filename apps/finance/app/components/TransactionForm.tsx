'use client'

import { useState, useEffect } from 'react'
import { COMMON_CURRENCIES, toDateInputValue, toDateTimeInputValue, fromDateInputValue } from '@repo/utils'
import { useCategories } from '../../hooks/useCategories'
import { useCreateTransaction } from '../../hooks/useCreateTransaction'

interface TransactionFormProps {
  onSuccess: () => void
}

export function TransactionForm({ onSuccess }: TransactionFormProps) {
  const [type, setType] = useState<'income' | 'expense'>('expense')
  const [amount, setAmount] = useState('')
  const [currency, setCurrency] = useState('EGP')
  const [category, setCategory] = useState('')
  const [description, setDescription] = useState('')
  const [date, setDate] = useState(new Date())
  const [includeTime, setIncludeTime] = useState(false)
  const [exchangeRate, setExchangeRate] = useState('')
  const [useManualRate, setUseManualRate] = useState(false)

  // Server state from TanStack Query
  const { data: categories = [] } = useCategories({ type })
  const createTransaction = useCreateTransaction()

  // Set first category as default when type changes or categories load
  useEffect(() => {
    if (categories.length > 0 && categories[0]) {
      setCategory(categories[0].name)
    } else {
      setCategory('')
    }
  }, [categories])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const categoryId = categories.find((c) => c.name === category)?.id
    if (!categoryId) {
      return
    }

    const transactionData = {
      type,
      amount: parseFloat(amount),
      currency,
      categoryId,
      description: description || undefined,
      date: date.toISOString(),
      ...(useManualRate && exchangeRate && { exchangeRate: parseFloat(exchangeRate) }),
    }

    createTransaction.mutate(transactionData, {
      onSuccess: () => {
        onSuccess()
        // Reset form
        setAmount('')
        setDescription('')
        setDate(new Date())
        setExchangeRate('')
        setUseManualRate(false)
        setIncludeTime(false)
      },
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Error Message */}
      {createTransaction.error && (
        <div className="bg-ios-red/10 border-l-4 border-ios-red text-ios-red p-4 rounded-ios-sm" role="alert">
          <p className="font-bold">Error</p>
          <p>{createTransaction.error.message}</p>
        </div>
      )}

      {/* Type Selection */}
      <div>
        <label className="block text-ios-footnote font-medium text-ios-gray-1 mb-2">Type</label>
        <div className="flex gap-4">
          <button
            type="button"
            onClick={() => setType('income')}
            className={`flex-1 py-3 px-4 rounded-ios font-semibold transition-all ${
              type === 'income'
                ? 'bg-ios-green text-white'
                : 'bg-ios-gray-6 text-ios-label-primary border border-ios-gray-3 hover:border-ios-gray-2'
            }`}
          >
            Income
          </button>
          <button
            type="button"
            onClick={() => setType('expense')}
            className={`flex-1 py-3 px-4 rounded-ios font-semibold transition-all ${
              type === 'expense'
                ? 'bg-ios-red text-white'
                : 'bg-ios-gray-6 text-ios-label-primary border border-ios-gray-3 hover:border-ios-gray-2'
            }`}
          >
            Expense
          </button>
        </div>
      </div>

      {/* Amount and Currency */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="amount" className="block text-ios-footnote font-medium text-ios-gray-1 mb-2">
            Amount *
          </label>
          <input
            type="number"
            id="amount"
            step="0.01"
            min="0"
            required
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full min-h-[44px] px-4 py-3 bg-ios-gray-6 border border-ios-gray-3 rounded-ios-sm text-ios-body focus:outline-none focus:ring-2 focus:ring-ios-blue focus:border-transparent"
            placeholder="0.00"
          />
        </div>
        <div>
          <label htmlFor="currency" className="block text-ios-footnote font-medium text-ios-gray-1 mb-2">
            Currency *
          </label>
          <select
            id="currency"
            required
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
            className="w-full min-h-[44px] px-4 py-3 bg-ios-gray-6 border border-ios-gray-3 rounded-ios-sm text-ios-body focus:outline-none focus:ring-2 focus:ring-ios-blue focus:border-transparent"
          >
            {COMMON_CURRENCIES.map((c) => (
              <option key={c.code} value={c.code}>
                {c.code} - {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Manual Exchange Rate (Optional) */}
      <div>
        <div className="flex items-center mb-2">
          <input
            type="checkbox"
            id="manualRate"
            checked={useManualRate}
            onChange={(e) => setUseManualRate(e.target.checked)}
            className="mr-2"
          />
          <label htmlFor="manualRate" className="text-sm font-medium text-gray-700">
            Set manual exchange rate
          </label>
        </div>
        {useManualRate && (
          <input
            type="number"
            step="0.000001"
            min="0"
            value={exchangeRate}
            onChange={(e) => setExchangeRate(e.target.value)}
            className="w-full min-h-[44px] px-4 py-3 bg-ios-gray-6 border border-ios-gray-3 rounded-ios-sm text-ios-body focus:outline-none focus:ring-2 focus:ring-ios-blue focus:border-transparent"
            placeholder="Exchange rate (e.g., 0.92)"
          />
        )}
      </div>

      {/* Category */}
      <div>
        <label htmlFor="category" className="block text-ios-footnote font-medium text-ios-gray-1 mb-2">
          Category *
        </label>
        {categories.length > 0 ? (
          <select
            id="category"
            required
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full min-h-[44px] px-4 py-3 bg-ios-gray-6 border border-ios-gray-3 rounded-ios-sm text-ios-body focus:outline-none focus:ring-2 focus:ring-ios-blue focus:border-transparent"
          >
            {categories.map((c) => (
              <option key={c.id} value={c.name}>
                {c.name}
              </option>
            ))}
          </select>
        ) : (
          <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-lg">
            <p className="text-sm">
              No categories found for {type}. Please create a category first.
            </p>
          </div>
        )}
      </div>

      {/* Description */}
      <div>
        <label htmlFor="description" className="block text-ios-footnote font-medium text-ios-gray-1 mb-2">
          Description (Optional)
        </label>
        <textarea
          id="description"
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full min-h-[44px] px-4 py-3 bg-ios-gray-6 border border-ios-gray-3 rounded-ios-sm text-ios-body focus:outline-none focus:ring-2 focus:ring-ios-blue focus:border-transparent"
          placeholder="Add notes about this transaction..."
        />
      </div>

      {/* Date & Time */}
      <div className="space-y-3">
        <label htmlFor="date" className="block text-sm font-medium text-gray-700">
          Date & Time *
        </label>
        
        {/* Date Input */}
        <input
          type="date"
          id="date"
          required
          value={toDateInputValue(date)}
          onChange={(e) => {
            const newDate = fromDateInputValue(e.target.value)
            // Preserve time if includeTime is true
            if (includeTime) {
              newDate.setHours(date.getHours(), date.getMinutes())
            }
            setDate(newDate)
          }}
          className="w-full min-h-[44px] px-4 py-3 bg-ios-gray-6 border border-ios-gray-3 rounded-ios-sm text-ios-body focus:outline-none focus:ring-2 focus:ring-ios-blue focus:border-transparent"
        />
        
        {/* Time Toggle */}
        <div className="flex items-center">
          <input
            type="checkbox"
            id="includeTime"
            checked={includeTime}
            onChange={(e) => setIncludeTime(e.target.checked)}
            className="mr-2"
          />
          <label htmlFor="includeTime" className="text-sm text-gray-700">
            Include specific time
          </label>
        </div>
        
        {/* Time Input (only if enabled) */}
        {includeTime && (
          <input
            type="time"
            value={toDateTimeInputValue(date).split('T')[1]}
            onChange={(e) => {
              const [hours, minutes] = e.target.value.split(':')
              const newDate = new Date(date)
              newDate.setHours(parseInt(hours || '0'), parseInt(minutes || '0'))
              setDate(newDate)
            }}
            className="w-full min-h-[44px] px-4 py-3 bg-ios-gray-6 border border-ios-gray-3 rounded-ios-sm text-ios-body focus:outline-none focus:ring-2 focus:ring-ios-blue focus:border-transparent"
          />
        )}
      </div>

      {/* Submit Button */}
      <div className="flex justify-end gap-3 pt-4">
        <button
          type="submit"
          disabled={createTransaction.isPending || categories.length === 0}
          className="px-6 py-3 bg-ios-blue text-white rounded-ios font-semibold hover:bg-ios-blue/90 disabled:opacity-40 disabled:cursor-not-allowed transition-all active:scale-95"
        >
          {createTransaction.isPending ? 'Creating...' : 'Create Transaction'}
        </button>
      </div>
    </form>
  )
}
