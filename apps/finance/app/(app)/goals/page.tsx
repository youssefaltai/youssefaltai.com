'use client'

import { Card } from '@repo/ui'

export default function GoalsPage() {
  // Mock data for demonstration
  const goals = [
    { id: '1', name: 'Emergency Fund', target: 50000, current: 32000, currency: 'EGP', deadline: '2025-12-31' },
    { id: '2', name: 'Vacation', target: 30000, current: 18000, currency: 'EGP', deadline: '2025-08-01' },
    { id: '3', name: 'New Laptop', target: 40000, current: 5000, currency: 'EGP', deadline: '2025-06-01' },
  ]

  return (
    <div className="min-h-screen bg-ios-gray-6">
      <div className="max-w-lg mx-auto">
        {/* Header */}
        <div className="px-4 pt-6 pb-4">
          <h1 className="text-ios-title-1 font-bold text-ios-label-primary">Goals</h1>
          <p className="text-ios-body text-ios-gray-1 mt-1">Track your financial goals</p>
        </div>

        {/* Goals List */}
        <div className="px-4 space-y-4 mb-6">
          {goals.length === 0 ? (
            <Card className="text-center py-12">
              <svg className="w-16 h-16 mx-auto text-ios-gray-3 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
              </svg>
              <p className="text-ios-body font-medium text-ios-gray-1">No goals yet</p>
              <p className="text-ios-footnote text-ios-gray-2 mt-1">Set your first financial goal</p>
            </Card>
          ) : (
            goals.map((goal) => {
              const percentage = Math.min((goal.current / goal.target) * 100, 100)
              const deadline = new Date(goal.deadline)
              const daysLeft = Math.ceil((deadline.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
              
              return (
                <Card key={goal.id}>
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-ios-headline font-semibold text-ios-label-primary">{goal.name}</h3>
                      <p className="text-ios-footnote text-ios-gray-1 mt-1">
                        {daysLeft > 0 ? `${daysLeft} days left` : 'Overdue'}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-ios-headline font-bold text-ios-blue">
                        {percentage.toFixed(0)}%
                      </p>
                    </div>
                  </div>
                  
                  {/* Progress Bar */}
                  <div className="w-full h-2 bg-ios-gray-5 rounded-full overflow-hidden mb-3">
                    <div
                      className="h-full bg-ios-blue transition-all duration-300"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between text-ios-callout">
                    <span className="text-ios-gray-1">
                      {goal.current.toLocaleString()} {goal.currency}
                    </span>
                    <span className="text-ios-gray-2">
                      of {goal.target.toLocaleString()} {goal.currency}
                    </span>
                  </div>
                  
                  <p className="text-ios-caption text-ios-gray-2 mt-2">
                    {(goal.target - goal.current).toLocaleString()} {goal.currency} remaining
                  </p>
                </Card>
              )
            })
          )}
        </div>

        {/* Add Goal Button */}
        <div className="px-4">
          <button className="w-full py-3 border-2 border-dashed border-ios-gray-3 rounded-ios text-ios-gray-1 hover:border-ios-blue hover:text-ios-blue transition-colors text-ios-body font-medium">
            + Add New Goal
          </button>
        </div>
      </div>
    </div>
  )
}

