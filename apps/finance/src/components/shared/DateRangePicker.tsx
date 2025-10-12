'use client'

import { Button } from '@repo/ui'
import { Input } from '@repo/ui'
import { useState } from 'react'
import { isoToDateInput, dateInputToISO } from '../../utils/format'

interface DateRange {
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
    const start = new Date(today.setHours(0, 0, 0, 0)).toISOString()
    const end = new Date(today.setHours(23, 59, 59, 999)).toISOString()
    return { start, end }
  }

  const getThisWeek = (): DateRange => {
    const today = new Date()
    const dayOfWeek = today.getDay()
    const startOfWeek = new Date(today)
    startOfWeek.setDate(today.getDate() - dayOfWeek)
    startOfWeek.setHours(0, 0, 0, 0)
    
    const endOfWeek = new Date(startOfWeek)
    endOfWeek.setDate(startOfWeek.getDate() + 6)
    endOfWeek.setHours(23, 59, 59, 999)
    
    return {
      start: startOfWeek.toISOString(),
      end: endOfWeek.toISOString(),
    }
  }

  const getThisMonth = (): DateRange => {
    const today = new Date()
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59, 999)
    
    return {
      start: startOfMonth.toISOString(),
      end: endOfMonth.toISOString(),
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
    const isoDate = dateInputToISO(dateString)
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
              value={isoToDateInput(value.start)}
              onChange={(e) => handleCustomChange('start', e.target.value)}
            />
          </div>
          <div>
            <label className="text-ios-footnote text-ios-gray-1 block mb-1">
              End Date
            </label>
            <Input
              type="date"
              value={isoToDateInput(value.end)}
              onChange={(e) => handleCustomChange('end', e.target.value)}
            />
          </div>
        </div>
      )}
    </div>
  )
}

