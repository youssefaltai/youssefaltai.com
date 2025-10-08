'use client'

import { useEffect, useState } from 'react'
import { formatCurrency } from '@repo/utils'
import { Button, Card } from '@repo/ui'
import { TransactionList } from './TransactionList'
import { TransactionForm } from './TransactionForm'
import { CategoryManager } from './CategoryManager'

interface Summary {
  dateFrom: string
  dateTo: string
  baseCurrency: string
  income: number
  expenses: number
  balance: number
  transactionCount: number
}

interface Transaction {
  id: string
  amount: number
  currency: string
  baseAmount: number
  baseCurrency: string
  type: 'income' | 'expense'
  category: string
  description?: string
  date: string
  createdAt: string
}

export function FinanceDashboard() {
  const [summary, setSummary] = useState<Summary | null>(null)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddTransaction, setShowAddTransaction] = useState(false)
  const [showCategories, setShowCategories] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)

  // Fetch summary and recent transactions
  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true)
        const [summaryRes, transactionsRes] = await Promise.all([
          fetch('/api/summary'),
          fetch('/api/transactions?limit=10'),
        ])

        if (summaryRes.ok) {
          const data = await summaryRes.json()
          setSummary(data.summary)
        }

        if (transactionsRes.ok) {
          const data = await transactionsRes.json()
          setTransactions(data.transactions)
        }
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [refreshKey])

  const handleTransactionAdded = () => {
    setShowAddTransaction(false)
    setRefreshKey(prev => prev + 1) // Trigger refresh
  }

  const handleTransactionDeleted = () => {
    setRefreshKey(prev => prev + 1) // Trigger refresh
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-ios-gray-6 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-ios-title-1 font-bold text-ios-label-primary">Finance</h1>
            <p className="text-ios-body text-ios-gray-1 mt-1">Track your income and expenses</p>
          </div>
          <div className="flex gap-3">
            <Button
              variant="secondary"
              onClick={() => setShowCategories(true)}
            >
              Manage Categories
            </Button>
            <Button
              variant="primary"
              onClick={() => setShowAddTransaction(true)}
            >
              + Add Transaction
            </Button>
          </div>
        </div>

        {/* Summary Cards */}
        {summary && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            {/* Income Card */}
            <Card>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-ios-footnote text-ios-gray-1 mb-1">Total Income</p>
                  <p className="text-ios-title-2 font-bold text-ios-green">
                    {formatCurrency(summary.income, summary.baseCurrency)}
                  </p>
                </div>
                <div className="bg-ios-green/10 p-3 rounded-full">
                  <svg className="w-6 h-6 text-ios-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </div>
              </div>
            </Card>

            {/* Expenses Card */}
            <Card>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-ios-footnote text-ios-gray-1 mb-1">Total Expenses</p>
                  <p className="text-ios-title-2 font-bold text-ios-red">
                    {formatCurrency(summary.expenses, summary.baseCurrency)}
                  </p>
                </div>
                <div className="bg-ios-red/10 p-3 rounded-full">
                  <svg className="w-6 h-6 text-ios-red" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                  </svg>
                </div>
              </div>
            </Card>

            {/* Balance Card */}
            <Card>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-ios-footnote text-ios-gray-1 mb-1">Net Balance</p>
                  <p className={`text-ios-title-2 font-bold ${summary.balance >= 0 ? 'text-ios-blue' : 'text-ios-red'}`}>
                    {formatCurrency(summary.balance, summary.baseCurrency)}
                  </p>
                </div>
                <div className="bg-ios-blue/10 p-3 rounded-full">
                  <svg className="w-6 h-6 text-ios-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Transaction List */}
        <Card padding="none">
          <div className="p-6 border-b border-ios-gray-5">
            <h2 className="text-ios-title-3 font-semibold text-ios-label-primary">Recent Transactions</h2>
          </div>
          <TransactionList
            transactions={transactions}
            onTransactionDeleted={handleTransactionDeleted}
          />
        </Card>

        {/* Add Transaction Modal */}
        {showAddTransaction && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center p-4 z-50">
            <Card className="max-w-2xl w-full max-h-[90vh] overflow-y-auto" padding="lg">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-ios-title-2 font-bold text-ios-label-primary">Add Transaction</h2>
                <button
                  onClick={() => setShowAddTransaction(false)}
                  className="text-ios-gray-1 hover:text-ios-label-primary p-2 -mr-2"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <TransactionForm onSuccess={handleTransactionAdded} />
            </Card>
          </div>
        )}

        {/* Category Manager Modal */}
        {showCategories && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center p-4 z-50">
            <Card className="max-w-4xl w-full max-h-[90vh] overflow-y-auto" padding="lg">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-ios-title-2 font-bold text-ios-label-primary">Manage Categories</h2>
                <button
                  onClick={() => setShowCategories(false)}
                  className="text-ios-gray-1 hover:text-ios-label-primary p-2 -mr-2"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <CategoryManager />
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
