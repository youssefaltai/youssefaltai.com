'use client'

import { useState } from 'react'
import { Paper, Text, Group, NumberInput, Button, Stack } from '@mantine/core'
import { Currency } from '@repo/db'
import { useExchangeRates, useSetExchangeRate } from '../../hooks/use-exchange-rates'
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
  const [editValue, setEditValue] = useState<number | string>('')

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
    setEditValue(rateObj ? Number(rateObj.rate) : '')
  }

  const handleSave = async (from: Currency, to: Currency) => {
    const rate = typeof editValue === 'number' ? editValue : parseFloat(editValue as string)
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
      <div>
        <Text fw={600} size="sm" mb="xs" c="dimmed">Exchange Rates</Text>
        <Paper p="lg" withBorder>
          <Text c="dimmed" ta="center">Loading exchange rates...</Text>
        </Paper>
      </div>
    )
  }

  return (
    <div>
      <Text fw={600} size="sm" mb="xs" c="dimmed">Exchange Rates</Text>
      <Paper withBorder>
        <Stack gap={0}>
          {CURRENCY_PAIRS.map((pair, index) => {
            const rateObj = getRate(pair.from, pair.to)
            const isEditing = editingPair === `${pair.from}_${pair.to}`
            const isLast = index === CURRENCY_PAIRS.length - 1
            const currentRate = rateObj ? Number(rateObj.rate) : null
            const showStaleWarning = rateObj && isStale(rateObj.updatedAt)

            return (
              <Group
                key={`${pair.from}_${pair.to}`}
                p="md"
                justify="space-between"
                align="flex-start"
                style={{
                  borderBottom: !isLast ? '1px solid var(--mantine-color-gray-3)' : 'none',
                }}
              >
                <div style={{ flex: 1 }}>
                  <Text fw={500}>{pair.label}</Text>
                  {!isEditing && !rateObj && (
                    <Text size="xs" c="dimmed" mt={2}>Not set</Text>
                  )}
                  {!isEditing && rateObj && (
                    <Text size="xs" c="dimmed" mt={2}>
                      Last updated: {formatRelative(new Date(rateObj.updatedAt), new Date())}
                      {showStaleWarning && (
                        <span style={{ color: 'var(--mantine-color-orange-6)', marginLeft: '0.5rem' }}>
                          ⚠ Consider updating
                        </span>
                      )}
                    </Text>
                  )}
                </div>

                {isEditing ? (
                  <Group gap="xs">
                    <NumberInput
                      value={editValue}
                      onChange={setEditValue}
                      placeholder="0.00"
                      decimalScale={6}
                      min={0}
                      style={{ width: '120px' }}
                      size="xs"
                    />
                    <Button
                      onClick={() => handleSave(pair.from, pair.to)}
                      loading={setExchangeRate.isPending}
                      size="xs"
                    >
                      Save
                    </Button>
                    <Button
                      onClick={handleCancel}
                      disabled={setExchangeRate.isPending}
                      variant="subtle"
                      size="xs"
                    >
                      Cancel
                    </Button>
                  </Group>
                ) : (
                  <Group gap="sm">
                    {currentRate !== null && (
                      <Text ff="monospace" c="dimmed">
                        {currentRate.toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 6,
                        })}
                      </Text>
                    )}
                    <Button
                      onClick={() => handleEdit(pair.from, pair.to)}
                      variant="light"
                      size="xs"
                    >
                      {currentRate !== null ? 'Edit' : 'Set'}
                    </Button>
                  </Group>
                )}
              </Group>
            )
          })}

          <Group p="md" gap="xs" style={{ backgroundColor: 'var(--mantine-color-gray-0)' }}>
            <Text size="xs" c="dimmed">
              💡 <strong>Tip:</strong> These rates are used when calculating totals across different currencies. 
              Update them regularly for accurate financial summaries.
            </Text>
          </Group>
        </Stack>
      </Paper>
    </div>
  )
}
