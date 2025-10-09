'use client'

import { Card } from '@repo/ui'

export default function BudgetsPage() {
  // Mock data for demonstration
  const budgets = [
    { id: '1', category: 'Groceries', limit: 5000, spent: 3200, currency: 'EGP' },
    { id: '2', category: 'Entertainment', limit: 2000, spent: 1800, currency: 'EGP' },
    { id: '3', category: 'Transportation', limit: 1500, spent: 900, currency: 'EGP' },
  ]

  return (
    <div className="min-h-screen bg-ios-gray-6">
      <div className="max-w-lg mx-auto">
        {/* Header */}
        <div className="px-4 pt-6 pb-4">
          <h1 className="text-ios-title-1 font-bold text-ios-label-primary">Budgets</h1>
          <p className="text-ios-body text-ios-gray-1 mt-1">Manage your spending limits</p>
        </div>

        {/* Budgets List */}
        <div className="px-4 space-y-4 mb-6">
          {budgets.length === 0 ? (
            <Card className="text-center py-12">
              <svg className="w-16 h-16 mx-auto text-ios-gray-3 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <p className="text-ios-body font-medium text-ios-gray-1">No budgets yet</p>
              <p className="text-ios-footnote text-ios-gray-2 mt-1">Create your first budget to track spending</p>
            </Card>
          ) : (
            budgets.map((budget) => {
              const percentage = Math.min((budget.spent / budget.limit) * 100, 100)
              const isOverBudget = budget.spent > budget.limit
              
              return (
                <Card key={budget.id}>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-ios-headline font-semibold text-ios-label-primary">{budget.category}</h3>
                    <span className={`text-ios-callout font-semibold ${isOverBudget ? 'text-ios-red' : 'text-ios-gray-1'}`}>
                      {budget.spent.toLocaleString()} / {budget.limit.toLocaleString()} {budget.currency}
                    </span>
                  </div>
                  
                  {/* Progress Bar */}
                  <div className="w-full h-2 bg-ios-gray-5 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 ${
                        isOverBudget ? 'bg-ios-red' : percentage > 80 ? 'bg-ios-orange' : 'bg-ios-green'
                      }`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  
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
      </div>
    </div>
  )
}

