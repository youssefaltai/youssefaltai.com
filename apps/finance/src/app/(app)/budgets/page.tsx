'use client'

import { Card, Wallet, PageHeader, EmptyState, ProgressBar } from '@repo/ui'

export default function BudgetsPage() {
  // Mock data for demonstration
  const budgets = [
    { id: '1', category: 'Groceries', limit: 5000, spent: 3200, currency: 'EGP' },
    { id: '2', category: 'Entertainment', limit: 2000, spent: 1800, currency: 'EGP' },
    { id: '3', category: 'Transportation', limit: 1500, spent: 900, currency: 'EGP' },
  ]

  return (
    <>
      <PageHeader title="Budgets" subtitle="Manage your spending limits" />

        {/* Budgets List */}
        <div className="px-4 space-y-4 mb-6">
          {budgets.length === 0 ? (
            <EmptyState
              icon={Wallet}
              title="No budgets yet"
              description="Create your first budget to track spending"
            />
          ) : (
            budgets.map((budget) => {
              const percentage = Math.min((budget.spent / budget.limit) * 100, 100)
              const isOverBudget = budget.spent > budget.limit
              const color = isOverBudget ? 'red' : percentage > 80 ? 'orange' : 'green'
              
              return (
                <Card key={budget.id}>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-ios-headline font-semibold text-ios-label-primary">{budget.category}</h3>
                    <span className={`text-ios-callout font-semibold ${isOverBudget ? 'text-ios-red' : 'text-ios-gray-1'}`}>
                      {budget.spent.toLocaleString()} / {budget.limit.toLocaleString()} {budget.currency}
                    </span>
                  </div>
                  
                  <ProgressBar percentage={percentage} color={color} />
                  
                  <p className="text-ios-caption text-ios-gray-2 mt-2">
                    {isOverBudget
                      ? `Over budget by ${(budget.spent - budget.limit).toLocaleString()} ${budget.currency}`
                      : `${(budget.limit - budget.spent).toLocaleString()} ${budget.currency} remaining`}
                  </p>
                </Card>
              )
            })
          )}
        </div>

      {/* Add Budget Button */}
      <div className="px-4">
        <button className="w-full py-3 border-2 border-dashed border-ios-gray-3 rounded-ios text-ios-gray-1 hover:border-ios-blue hover:text-ios-blue transition-colors text-ios-body font-medium">
          + Add New Budget
        </button>
      </div>
    </>
  )
}

