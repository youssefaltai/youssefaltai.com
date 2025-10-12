'use client'

import { useMemo } from 'react'
import { format, startOfMonth, subMonths } from '@repo/utils'
import { ChevronRight } from '@repo/ui'

interface MonthSelectorProps {
  selectedMonth: string | undefined
  onChange: (month: string | undefined) => void
  earliestDate?: Date
}

/**
 * Month selector dropdown for dashboard
 * Shows months from earliest transaction/account to current month
 */
export function MonthSelector({ selectedMonth, onChange, earliestDate }: MonthSelectorProps) {
  // Generate list of available months
  const availableMonths = useMemo(() => {
    const months: Array<{ value: string | undefined; label: string }> = []
    const now = new Date()
    const currentMonthStart = startOfMonth(now)
    
    // Always include "Current Month" option
    months.push({ value: undefined, label: 'Current Month' })
    
    // Find earliest month (either from earliestDate or 24 months ago)
    const earliest = earliestDate || subMonths(now, 24)
    const earliestMonthStart = startOfMonth(earliest)
    
    // Generate months from current back to earliest
    let monthDate = startOfMonth(subMonths(currentMonthStart, 1)) // Start from last month
    
    while (monthDate >= earliestMonthStart) {
      const monthValue = format(monthDate, 'yyyy-MM')
      const monthLabel = format(monthDate, 'MMMM yyyy')
      months.push({ value: monthValue, label: monthLabel })
      monthDate = subMonths(monthDate, 1)
    }
    
    return months
  }, [earliestDate])
  
  return (
    <div className="px-4 pb-4">
      <label htmlFor="month-selector" className="sr-only">
        Select Month
      </label>
      <div className="relative">
        <select
          id="month-selector"
          value={selectedMonth || ''}
          onChange={(e) => onChange(e.target.value || undefined)}
          className="w-full appearance-none bg-white border border-ios-gray-5 rounded-ios pl-4 pr-10 py-3 text-ios-body text-ios-label-primary font-medium shadow-ios hover:bg-ios-gray-6 focus:outline-none focus:ring-2 focus:ring-ios-blue focus:border-ios-blue transition-colors cursor-pointer"
        >
          {availableMonths.map((month) => (
            <option key={month.value || 'current'} value={month.value || ''}>
              {month.label}
            </option>
          ))}
        </select>
        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
          <ChevronRight className="w-5 h-5 text-ios-gray-2 rotate-90" />
        </div>
      </div>
    </div>
  )
}

