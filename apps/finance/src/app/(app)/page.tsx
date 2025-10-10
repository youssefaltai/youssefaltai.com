'use client'

import { Card, BarChart3, FloatingActionButton, Plus, PageHeader, EmptyState } from '@repo/ui'
import { formatCurrency, formatDateShort, getGreeting, getTransactionColorClass } from '@repo/utils'
import { useTransactions } from '@/features/transactions/hooks/useTransactions'
import { useSummary } from '@/features/dashboard/hooks/useSummary'

export default function Home() {
  // Server state from TanStack Query - automatic caching, loading, and error handling
  const { data: summary } = useSummary()
  const { data: transactions = [] } = useTransactions({ limit: 5 })

  const greeting = getGreeting()

  return (
    <>
      <PageHeader title={`Good ${greeting}`} subtitle="Here's your financial overview" />

        {/* Balance Card */}
        {summary && (
          <div className="px-4 mb-6">
            <Card className="bg-gradient-to-br from-ios-blue to-ios-blue/80 text-white">
              <div className="text-center py-6">
                <p className="text-ios-footnote opacity-90 mb-2">Total Balance</p>
                <p className="text-[40px] font-bold leading-none mb-1">
                  {formatCurrency(summary.balance, summary.baseCurrency)}
                </p>
                <div className="flex justify-center gap-6 mt-6 pt-6 border-t border-white/20">
                  <div>
                    <p className="text-ios-caption opacity-75">Income</p>
                    <p className="text-ios-headline font-semibold">
                      {formatCurrency(summary.income, summary.baseCurrency)}
                    </p>
                  </div>
                  <div>
                    <p className="text-ios-caption opacity-75">Expenses</p>
                    <p className="text-ios-headline font-semibold">
                      {formatCurrency(summary.expenses, summary.baseCurrency)}
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Monthly Overview Chart Placeholder */}
        <div className="px-4 mb-6">
          <h2 className="text-ios-headline font-semibold text-ios-label-primary mb-3">Monthly Overview</h2>
          <Card className="h-48 flex items-center justify-center">
            <div className="text-center text-ios-gray-2">
              <BarChart3 className="w-16 h-16 mx-auto mb-2" strokeWidth={1.5} />
              <p className="text-ios-callout">Chart coming soon</p>
            </div>
          </Card>
        </div>

        {/* Budget Summary Placeholder */}
        <div className="px-4 mb-6">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-ios-headline font-semibold text-ios-label-primary">Budgets</h2>
            <button className="text-ios-blue text-ios-callout font-medium">See All</button>
          </div>
          <EmptyState
            icon={BarChart3}
            title="No budgets set yet"
            description="Create your first budget to track spending"
          />
        </div>

        {/* Recent Transactions */}
        <div className="px-4 mb-6">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-ios-headline font-semibold text-ios-label-primary">Recent Transactions</h2>
            <button className="text-ios-blue text-ios-callout font-medium">See All</button>
          </div>
          {transactions.length === 0 ? (
            <EmptyState
              icon={Plus}
              title="No transactions yet"
              description="Tap + to add your first transaction"
            />
          ) : (
            <Card padding="none">
              {transactions.map((transaction, index) => (
                <div
                  key={transaction.id}
                  className={`flex items-center justify-between p-4 ${index !== transactions.length - 1 ? 'border-b border-ios-gray-5' : ''
                    }`}
                >
                  <div>
                    <p className="text-ios-body font-medium text-ios-label-primary">{transaction.category}</p>
                    <p className="text-ios-footnote text-ios-gray-1">{formatDateShort(transaction.date)}</p>
                  </div>
                  <p className={`text-ios-body font-semibold ${getTransactionColorClass(transaction.type)}`}>
                    {transaction.type === 'income' ? '+' : '-'}
                    {formatCurrency(transaction.baseAmount, transaction.baseCurrency)}
                  </p>
                </div>
              ))}
            </Card>
          )}
        </div>

      {/* Floating Action Button */}
      <FloatingActionButton
        icon={Plus}
        onClick={() => {
          // TODO: Navigate to add transaction page
          console.log('Add transaction')
        }}
        label="Add transaction"
        className="fixed bottom-20 right-6 z-40"
      />
    </>
  )
}
