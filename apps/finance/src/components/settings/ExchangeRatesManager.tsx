'use client'

import { useState } from 'react'
import { Currency } from '@repo/db'
import { useExchangeRates, useSetExchangeRate } from '../../hooks/use-exchange-rates'
import { CardSection } from '@repo/ui'
import { formatRelative, differenceInDays } from '@repo/utils'

const CURRENCY_PAIRS: Array<{ from: Currency; to: Currency; label: string }> = [
  { from: Currency.USD, to: Currency.EGP, label: '1 USD = ? EGP' },
  { from: Currency.GOLD, to: Currency.EGP, label: '1g Gold = ? EGP' },
  { from: Currency.USD, to: Currency.GOLD, label: '1 USD = ? g Gold' },
]

/**
 * Check if exchange rate hasn't been updated in 30+ days
 */
function isStale(updatedAt: Date | string): boolean {
  const daysSinceUpdate = differenceInDays(new Date(), new Date(updatedAt))
  return daysSinceUpdate > 30
}

export function ExchangeRatesManager() {
  const { data: rates = [], isLoading } = useExchangeRates()
  const setExchangeRate = useSetExchangeRate()
  const [editingPair, setEditingPair] = useState<string | null>(null)
  const [editValue, setEditValue] = useState('')

  // Get current rate for a currency pair
  const getRate = (from: Currency, to: Currency) => {
    const rate = rates.find(
      (r) => r.fromCurrency === from && r.toCurrency === to
    )
    return rate
  }

  const handleEdit = (from: Currency, to: Currency) => {
    const rateObj = getRate(from, to)
    setEditingPair(`${from}_${to}`)
    setEditValue(rateObj ? Number(rateObj.rate).toString() : '')
  }

  const handleSave = async (from: Currency, to: Currency) => {
    const rate = parseFloat(editValue)
    if (isNaN(rate) || rate <= 0) {
      alert('Please enter a valid positive number')
      return
    }

    try {
      await setExchangeRate.mutateAsync({
        fromCurrency: from,
        toCurrency: to,
        rate,
      })
      setEditingPair(null)
      setEditValue('')
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to update exchange rate')
    }
  }

  const handleCancel = () => {
    setEditingPair(null)
    setEditValue('')
  }

  if (isLoading) {
    return (
      <CardSection title="Exchange Rates">
        <div className="px-4 py-6 text-center text-ios-gray-1">
          Loading exchange rates...
        </div>
      </CardSection>
    )
  }

  return (
    <CardSection title="Exchange Rates">
      {CURRENCY_PAIRS.map((pair, index) => {
        const rateObj = getRate(pair.from, pair.to)
        const isEditing = editingPair === `${pair.from}_${pair.to}`
        const isLast = index === CURRENCY_PAIRS.length - 1
        const currentRate = rateObj ? Number(rateObj.rate) : null
        const showStaleWarning = rateObj && isStale(rateObj.updatedAt)

        return (
          <div
            key={`${pair.from}_${pair.to}`}
            className={`px-4 py-3 ${!isLast ? 'border-b border-ios-gray-5' : ''}`}
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <span className="text-ios-body text-ios-label-primary">
                  {pair.label}
                </span>
                {!isEditing && !rateObj && (
                  <p className="text-ios-caption text-ios-gray-2 mt-0.5">
                    Not set
                  </p>
                )}
                {!isEditing && rateObj && (
                  <p className="text-ios-footnote text-ios-gray-2 mt-0.5">
                    Last updated: {formatRelative(new Date(rateObj.updatedAt), new Date())}
                    {showStaleWarning && (
                      <span className="text-ios-orange ml-1.5">⚠ Consider updating</span>
                    )}
                  </p>
                )}
              </div>

              {isEditing ? (
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    placeholder="0.00"
                    step="0.000001"
                    min="0"
                    className="w-24 px-2 py-1 text-ios-body text-right bg-ios-gray-6 border border-ios-gray-4 rounded-ios focus:outline-none focus:border-ios-blue"
                    autoFocus
                  />
                  <button
                    onClick={() => handleSave(pair.from, pair.to)}
                    disabled={setExchangeRate.isPending}
                    className="text-ios-blue text-ios-callout font-medium disabled:opacity-50"
                  >
                    Save
                  </button>
                  <button
                    onClick={handleCancel}
                    disabled={setExchangeRate.isPending}
                    className="text-ios-gray-1 text-ios-callout disabled:opacity-50"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  {currentRate !== null && (
                    <span className="text-ios-body text-ios-gray-1 font-mono">
                      {currentRate.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 6,
                      })}
                    </span>
                  )}
                  <button
                    onClick={() => handleEdit(pair.from, pair.to)}
                    className="text-ios-blue text-ios-callout font-medium"
                  >
                    {currentRate !== null ? 'Edit' : 'Set'}
                  </button>
                </div>
              )}
            </div>
          </div>
        )
      })}

      <div className="px-4 py-3 bg-ios-gray-6 border-t border-ios-gray-5">
        <p className="text-ios-caption text-ios-gray-1">
          💡 <strong>Tip:</strong> These rates are used when calculating totals across different currencies. 
          Update them regularly for accurate financial summaries.
        </p>
      </div>
    </CardSection>
  )
}

