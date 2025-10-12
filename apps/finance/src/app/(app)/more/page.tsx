'use client'

import { PageHeader, CardSection, ListItem } from '@repo/ui'
import { useRouter } from 'next/navigation'
import { useAssets } from '../../../hooks/use-assets'
import { useCreditCards } from '../../../hooks/use-credit-cards'
import { useLoans } from '../../../hooks/use-loans'
import { useIncomeSources } from '../../../hooks/use-income-sources'
import { useExpenseCategories } from '../../../hooks/use-expense-categories'

export default function MorePage() {
  const router = useRouter()
  const { data: assets = [] } = useAssets()
  const { data: creditCards = [] } = useCreditCards()
  const { data: loans = [] } = useLoans()
  const { data: incomeSources = [] } = useIncomeSources()
  const { data: expenseCategories = [] } = useExpenseCategories()

  return (
    <div className="p-4 pb-24">
      <PageHeader title="More" />

      <div className="space-y-6 mt-6">
        {/* Financial Entities */}
        <CardSection title="Financial Management">
          <ListItem
            label="Assets"
            value={assets.length > 0 ? `${assets.length}` : undefined}
            chevron
            onClick={() => router.push('/assets')}
          />
          <ListItem
            label="Credit Cards"
            value={creditCards.length > 0 ? `${creditCards.length}` : undefined}
            chevron
            onClick={() => router.push('/credit-cards')}
          />
          <ListItem
            label="Loans"
            value={loans.length > 0 ? `${loans.length}` : undefined}
            chevron
            onClick={() => router.push('/loans')}
          />
        </CardSection>

        {/* Categories */}
        <CardSection title="Categories">
          <ListItem
            label="Income Sources"
            value={incomeSources.length > 0 ? `${incomeSources.length}` : undefined}
            chevron
            onClick={() => router.push('/income-sources')}
          />
          <ListItem
            label="Expense Categories"
            value={expenseCategories.length > 0 ? `${expenseCategories.length}` : undefined}
            chevron
            onClick={() => router.push('/expense-categories')}
          />
        </CardSection>

        {/* Settings */}
        <CardSection title="Settings">
          <ListItem
            label="Profile"
            chevron
            onClick={() => router.push('/profile')}
          />
          <ListItem
            label="Preferences"
            chevron
            onClick={() => {
              // TODO: Create preferences page
              alert('Preferences page coming soon')
            }}
          />
        </CardSection>

        {/* About */}
        <CardSection title="About">
          <ListItem
            label="Help & Support"
            chevron
            onClick={() => {
              // TODO: Create help page
              alert('Help page coming soon')
            }}
          />
          <ListItem
            label="Version"
            value="1.0.0"
          />
        </CardSection>
      </div>
    </div>
  )
}

