'use client'

import { Plus, Wallet, Target, TrendingUp } from '@repo/ui'
import { cn } from '@repo/utils'

interface QuickActionsProps {
  onAddTransaction: () => void
  onAddGoal: () => void
  onViewAssets: () => void
  onViewReports: () => void
}

interface ActionButtonProps {
  icon: React.ComponentType<{ className?: string }>
  label: string
  onClick: () => void
  color?: 'blue' | 'green' | 'purple'
}

function ActionButton({
  icon: Icon,
  label,
  onClick,
  color = 'blue',
}: ActionButtonProps) {
  const colorClasses = {
    blue: 'bg-ios-blue/10 text-ios-blue',
    green: 'bg-ios-green/10 text-ios-green',
    purple: 'bg-purple-500/10 text-purple-500',
  }

  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center gap-2 p-4 rounded-ios bg-white border border-ios-gray-5 hover:bg-ios-gray-6 active:bg-ios-gray-5 transition-colors shadow-ios-sm"
    >
      <div
        className={cn(
          'w-12 h-12 rounded-full flex items-center justify-center',
          colorClasses[color]
        )}
      >
        <Icon className="w-6 h-6" />
      </div>
      <span className="text-ios-callout text-ios-label-primary font-medium">
        {label}
      </span>
    </button>
  )
}

/**
 * Quick actions grid for common tasks
 */
export function QuickActions({
  onAddTransaction,
  onAddGoal,
  onViewAssets,
  onViewReports,
}: QuickActionsProps) {
  return (
    <div className="space-y-3">
      <h2 className="text-ios-title-3 font-semibold text-ios-label-primary px-2">
        Quick Actions
      </h2>
      
      <div className="grid grid-cols-2 gap-3">
        <ActionButton
          icon={Plus}
          label="Add Transaction"
          onClick={onAddTransaction}
          color="blue"
        />
        <ActionButton
          icon={Target}
          label="Add Goal"
          onClick={onAddGoal}
          color="green"
        />
        <ActionButton
          icon={Wallet}
          label="View Assets"
          onClick={onViewAssets}
          color="purple"
        />
        <ActionButton
          icon={TrendingUp}
          label="View Reports"
          onClick={onViewReports}
          color="purple"
        />
      </div>
    </div>
  )
}

