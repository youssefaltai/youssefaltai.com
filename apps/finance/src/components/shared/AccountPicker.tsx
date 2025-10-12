'use client'

import { Money, GroupedSelect } from '@repo/ui'
import type { GroupedSelectGroup } from '@repo/ui'
import { useAssets } from '../../hooks/use-assets'
import { useGoals } from '../../hooks/use-goals'
import { useLoans } from '../../hooks/use-loans'
import { useCreditCards } from '../../hooks/use-credit-cards'
import { useIncomeSources } from '../../hooks/use-income-sources'
import { useExpenseCategories } from '../../hooks/use-expense-categories'
import { AccountType } from '@repo/db'

interface AccountPickerProps {
  value: string
  onChange: (value: string) => void
  label?: string
  placeholder?: string
  error?: string
  filterTypes?: AccountType[]
  excludeId?: string
}

/**
 * Finance-specific wrapper for GroupedSelect
 * Fetches all account types and formats them for grouped display
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
  const groupedAccountsMap: Record<string, typeof accounts> = {}
  accounts.forEach(acc => {
    if (!groupedAccountsMap[acc.groupLabel]) {
      groupedAccountsMap[acc.groupLabel] = []
    }
    groupedAccountsMap[acc.groupLabel]!.push(acc)
  })

  // Convert to GroupedSelectGroup format
  const groups: GroupedSelectGroup[] = Object.entries(groupedAccountsMap).map(([label, items]) => ({
    label,
    options: items.map(account => ({
      value: account.id,
      label: account.name,
      metadata: `${Money({ amount: Number(account.balance), currency: account.currency })}`,
    })),
  }))

  return (
    <GroupedSelect
      value={value}
      onChange={onChange}
      groups={groups}
      label={label}
      placeholder={placeholder}
      error={error}
    />
  )
}
