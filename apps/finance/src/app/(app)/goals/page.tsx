'use client'

import { Card, Target, PageHeader, EmptyState, ProgressBar } from '@repo/ui'

export default function GoalsPage() {
  // Mock data for demonstration
  const goals = [
    { id: '1', name: 'Emergency Fund', target: 50000, current: 32000, currency: 'EGP', deadline: '2025-12-31' },
    { id: '2', name: 'Vacation', target: 30000, current: 18000, currency: 'EGP', deadline: '2025-08-01' },
    { id: '3', name: 'New Laptop', target: 40000, current: 5000, currency: 'EGP', deadline: '2025-06-01' },
  ]

  return (
    <>
      <PageHeader title="Goals" subtitle="Track your financial goals" />

        {/* Goals List */}
        <div className="px-4 space-y-4 mb-6">
          {goals.length === 0 ? (
            <EmptyState
              icon={Target}
              title="No goals yet"
              description="Set your first financial goal"
            />
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
                  
                  <ProgressBar percentage={percentage} color="blue" className="mb-3" />
                  
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
    </>
  )
}

