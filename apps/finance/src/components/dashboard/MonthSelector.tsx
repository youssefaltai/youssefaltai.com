'use client'

import { MonthPickerInput } from '@mantine/dates'
import { format } from '@repo/utils'

interface MonthSelectorProps {
  selectedMonth: string | undefined
  onChange: (month: string | undefined) => void
  earliestDate?: Date
}

/**
 * Simple month selector for dashboard
 */
export function MonthSelector({ selectedMonth, onChange, earliestDate }: MonthSelectorProps) {
  // Convert string (YYYY-MM) to Date for MonthPickerInput
  const dateValue = selectedMonth
    ? new Date(`${selectedMonth}-01`)
    : null

  // Convert Date back to string (YYYY-MM) format
  const handleChange = (date: string | null) => {
    if (date) {
      onChange(format(date, 'yyyy-MM'))
    } else {
      onChange(undefined)
    }
  }

  return (
    <div style={{ padding: '0 1rem 1rem' }}>
      <MonthPickerInput
        label="View Month"
        placeholder="Current Month"
        value={dateValue}
        onChange={handleChange}
        minDate={earliestDate}
        maxDate={new Date()}
        clearable
        valueFormat="MMMM YYYY"
      />
    </div>
  )
}

