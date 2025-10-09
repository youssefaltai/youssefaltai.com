'use client'

import { Card, FloatingActionButton, Modal } from '@repo/ui'
import { TransactionForm } from './components/TransactionForm'
import { formatCurrency, formatDateShort } from '@repo/utils'
import { useTransactions } from '../hooks/useTransactions'
import { useSummary } from '../hooks/useSummary'
import { useModalStore } from '../stores/useModalStore'

export default function Home() {
  // UI state from Zustand
  const { showAddTransaction, openAddTransaction, closeAddTransaction } = useModalStore()
  
  // Server state from TanStack Query - automatic caching, loading, and error handling
  const { data: summary } = useSummary()
  const { data: transactions = [] } = useTransactions({ limit: 5 })

  const handleTransactionAdded = () => {
    closeAddTransaction()
    // No need to manually refetch - TanStack Query handles this automatically!
  }

  return (
    <div className="min-h-screen bg-ios-gray-6">
      <div className="max-w-lg mx-auto">
        {/* Header */}
        <div className="px-4 pt-6 pb-4">
          <h1 className="text-ios-title-1 font-bold text-ios-label-primary">
            Good {new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 18 ? 'Afternoon' : 'Evening'}
          </h1>
          <p className="text-ios-body text-ios-gray-1 mt-1">Here's your financial overview</p>
        </div>

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
              <svg className="w-16 h-16 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
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
          <Card className="text-center py-8">
            <p className="text-ios-gray-2 text-ios-callout">No budgets set yet</p>
            <p className="text-ios-gray-3 text-ios-footnote mt-1">Create your first budget to track spending</p>
          </Card>
        </div>

        {/* Recent Transactions */}
        <div className="px-4 mb-6">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-ios-headline font-semibold text-ios-label-primary">Recent Transactions</h2>
            <button className="text-ios-blue text-ios-callout font-medium">See All</button>
          </div>
          {transactions.length === 0 ? (
            <Card className="text-center py-8">
              <p className="text-ios-gray-2 text-ios-callout">No transactions yet</p>
              <p className="text-ios-gray-3 text-ios-footnote mt-1">Tap + to add your first transaction</p>
            </Card>
          ) : (
            <Card padding="none">
              {transactions.map((transaction, index) => (
                <div
                  key={transaction.id}
                  className={`flex items-center justify-between p-4 ${
                    index !== transactions.length - 1 ? 'border-b border-ios-gray-5' : ''
                  }`}
                >
                  <div>
                    <p className="text-ios-body font-medium text-ios-label-primary">{transaction.category}</p>
                    <p className="text-ios-footnote text-ios-gray-1">{formatDateShort(transaction.date)}</p>
                  </div>
                  <p
                    className={`text-ios-body font-semibold ${
                      transaction.type === 'income' ? 'text-ios-green' : 'text-ios-red'
                    }`}
                  >
                    {transaction.type === 'income' ? '+' : '-'}
                    {formatCurrency(transaction.baseAmount, transaction.baseCurrency)}
                  </p>
                </div>
              ))}
            </Card>
          )}
        </div>

        {/* Floating Action Button */}
        <FloatingActionButton onClick={openAddTransaction} />

        {/* Add Transaction Modal */}
        <Modal
          isOpen={showAddTransaction}
          onClose={closeAddTransaction}
          title="Add Transaction"
        >
          <TransactionForm onSuccess={handleTransactionAdded} />
        </Modal>
      </div>
    </div>
  )
}
