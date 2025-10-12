'use client'

import { Select } from '@repo/ui'
import { useAssets } from '../../hooks/use-assets'
import { useGoals } from '../../hooks/use-goals'
import { useLoans } from '../../hooks/use-loans'
import { useCreditCards } from '../../hooks/use-credit-cards'
import { useIncomeSources } from '../../hooks/use-income-sources'
import { useExpenseCategories } from '../../hooks/use-expense-categories'
import { formatCurrency } from '../../utils/format'
import { AccountType } from '@repo/db'

interface AccountPickerProps {
  value: string
  onChange: (value: string) => void
  label?: string
  placeholder?: string
  error?: string
  filterTypes?: AccountType[]
  excludeId?: string // Exclude a specific account (useful for "from" and "to" pickers)
}

/**
 * Account picker component
 * Shows all entities user can transact between, grouped by type
 * Displays user-friendly labels (never "Account")
 */
export function AccountPicker({
  value,
  onChange,
  label,
  placeholder = 'Select...',
  error,
  filterTypes,
  excludeId,
}: AccountPickerProps) {
  const { data: assets = [] } = useAssets()
  const { data: goals = [] } = useGoals()
  const { data: loans = [] } = useLoans()
  const { data: creditCards = [] } = useCreditCards()
  const { data: incomeSources = [] } = useIncomeSources()
  const { data: expenseCategories = [] } = useExpenseCategories()

  // Combine all accounts
  const allAccounts = [
    ...assets.map(a => ({ ...a, groupLabel: 'Assets' })),
    ...goals.map(g => ({ ...g, groupLabel: 'Goals' })),
    ...creditCards.map(c => ({ ...c, groupLabel: 'Credit Cards' })),
    ...loans.map(l => ({ ...l, groupLabel: 'Loans' })),
    ...incomeSources.map(i => ({ ...i, groupLabel: 'Income Sources' })),
    ...expenseCategories.map(e => ({ ...e, groupLabel: 'Expense Categories' })),
  ]

  // Filter by type if specified
  const filteredAccounts = filterTypes
    ? allAccounts.filter(acc => filterTypes.includes(acc.type))
    : allAccounts

  // Exclude specific account if specified
  const accounts = excludeId
    ? filteredAccounts.filter(acc => acc.id !== excludeId)
    : filteredAccounts

  // Group accounts by type
  const groupedAccounts: Record<string, typeof accounts> = {}
  accounts.forEach(acc => {
    if (!groupedAccounts[acc.groupLabel]) {
      groupedAccounts[acc.groupLabel] = []
    }
    groupedAccounts[acc.groupLabel]!.push(acc)
  })

  return (
    <div className="space-y-1">
      {label && (
        <label className="text-ios-footnote text-ios-gray-1">{label}</label>
      )}
      <Select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        error={error}
      >
        <option value="" disabled>
          {placeholder}
        </option>
        
        {Object.entries(groupedAccounts).map(([group, items]) => (
          <optgroup key={group} label={group}>
            {items.map(account => (
              <option key={account.id} value={account.id}>
                {account.name} ({formatCurrency(Number(account.balance), account.currency)})
              </option>
            ))}
          </optgroup>
        ))}
      </Select>
      {error && (
        <p className="text-ios-footnote text-ios-red">{error}</p>
      )}
    </div>
  )
}

