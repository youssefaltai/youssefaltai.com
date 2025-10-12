'use client'

import { Button } from './Button'
import { Input } from './Input'
import { useState } from 'react'
import { startOfDay, endOfDay, startOfMonth, endOfMonth, parseISO, startOfWeek, endOfWeek, format } from '@repo/utils'

export interface DateRange {
  start: string // ISO date string
  end: string // ISO date string
}

interface DateRangePickerProps {
  value: DateRange
  onChange: (range: DateRange) => void
  label?: string
}

/**
 * Date range picker with preset options
 * Presets: Today, This Week, This Month
 * Custom: start date + end date inputs
 */
export function DateRangePicker({ value, onChange, label }: DateRangePickerProps) {
  const [mode, setMode] = useState<'preset' | 'custom'>('preset')

  const getToday = (): DateRange => {
    const today = new Date()
    return {
      start: startOfDay(today).toISOString(),
      end: endOfDay(today).toISOString(),
    }
  }

  const getThisWeek = (): DateRange => {
    const today = new Date()
    return {
      start: startOfWeek(today).toISOString(),
      end: endOfWeek(today).toISOString(),
    }
  }

  const getThisMonth = (): DateRange => {
    const today = new Date()
    return {
      start: startOfMonth(today).toISOString(),
      end: endOfMonth(today).toISOString(),
    }
  }

  const handlePreset = (preset: 'today' | 'week' | 'month') => {
    let range: DateRange
    switch (preset) {
      case 'today':
        range = getToday()
        break
      case 'week':
        range = getThisWeek()
        break
      case 'month':
        range = getThisMonth()
        break
    }
    onChange(range)
  }

  const handleCustomChange = (field: 'start' | 'end', dateString: string) => {
    const isoDate = parseISO(dateString + 'T12:00:00').toISOString()
    onChange({
      ...value,
      [field]: isoDate,
    })
  }

  return (
    <div className="space-y-3">
      {label && (
        <label className="text-ios-footnote text-ios-gray-1">{label}</label>
      )}

      {/* Preset buttons */}
      <div className="flex gap-2">
        <Button
          variant="secondary"
          size="sm"
          onClick={() => {
            setMode('preset')
            handlePreset('today')
          }}
        >
          Today
        </Button>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => {
            setMode('preset')
            handlePreset('week')
          }}
        >
          This Week
        </Button>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => {
            setMode('preset')
            handlePreset('month')
          }}
        >
          This Month
        </Button>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => setMode('custom')}
        >
          Custom
        </Button>
      </div>

      {/* Custom date inputs */}
      {mode === 'custom' && (
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-ios-footnote text-ios-gray-1 block mb-1">
              Start Date
            </label>
            <Input
              type="date"
              value={format(parseISO(value.start), 'yyyy-MM-dd')}
              onChange={(e) => handleCustomChange('start', e.target.value)}
            />
          </div>
          <div>
            <label className="text-ios-footnote text-ios-gray-1 block mb-1">
              End Date
            </label>
            <Input
              type="date"
              value={format(parseISO(value.end), 'yyyy-MM-dd')}
              onChange={(e) => handleCustomChange('end', e.target.value)}
            />
          </div>
        </div>
      )}
    </div>
  )
}

