'use client'

import { useState, useEffect } from 'react'
import { Card } from '@repo/ui'
import { FloatingActionButton } from '../components/FloatingActionButton'
import { TransactionForm } from '../components/TransactionForm'
import { formatCurrency, formatDateShort } from '@repo/utils'

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
}

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [filter, setFilter] = useState<'all' | 'income' | 'expense'>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [showAddTransaction, setShowAddTransaction] = useState(false)

  useEffect(() => {
    fetchTransactions()
  }, [filter])

  const fetchTransactions = async () => {
    try {
      const params = new URLSearchParams()
      if (filter !== 'all') params.append('type', filter)
      
      const res = await fetch(`/api/transactions?${params}`)
      if (res.ok) {
        const data = await res.json()
        setTransactions(data.data)
      }
    } catch (error) {
      console.error('Error fetching transactions:', error)
    }
  }

  const handleTransactionAdded = () => {
    setShowAddTransaction(false)
    fetchTransactions()
  }

  const filteredTransactions = transactions.filter((transaction) =>
    transaction.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
    transaction.description?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-ios-gray-6">
      <div className="max-w-lg mx-auto">
        {/* Header */}
        <div className="px-4 pt-6 pb-4">
          <h1 className="text-ios-title-1 font-bold text-ios-label-primary">Transactions</h1>
          <p className="text-ios-body text-ios-gray-1 mt-1">Track all your spending</p>
        </div>

        {/* Search Bar */}
        <div className="px-4 mb-4">
          <input
            type="search"
            placeholder="Search transactions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full min-h-[44px] px-4 py-3 bg-white border border-ios-gray-5 rounded-ios-sm text-ios-body placeholder:text-ios-gray-2 focus:outline-none focus:ring-2 focus:ring-ios-blue focus:border-transparent"
          />
        </div>

        {/* Filter Chips */}
        <div className="px-4 mb-6 flex gap-2">
          {['all', 'income', 'expense'].map((filterOption) => (
            <button
              key={filterOption}
              onClick={() => setFilter(filterOption as typeof filter)}
              className={`px-4 py-2 rounded-full text-ios-callout font-medium transition-all ${
                filter === filterOption
                  ? 'bg-ios-blue text-white'
                  : 'bg-white text-ios-gray-1 border border-ios-gray-5'
              }`}
            >
              {filterOption.charAt(0).toUpperCase() + filterOption.slice(1)}
            </button>
          ))}
        </div>

        {/* Transactions List */}
        <div className="px-4 mb-6">
          {filteredTransactions.length === 0 ? (
            <Card className="text-center py-12">
              <svg className="w-16 h-16 mx-auto text-ios-gray-3 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="text-ios-body font-medium text-ios-gray-1">No transactions found</p>
              <p className="text-ios-footnote text-ios-gray-2 mt-1">Try adjusting your filters</p>
            </Card>
          ) : (
            <Card padding="none">
              {filteredTransactions.map((transaction, index) => (
                <div
                  key={transaction.id}
                  className={`p-4 ${index !== filteredTransactions.length - 1 ? 'border-b border-ios-gray-5' : ''}`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex-1">
                      <p className="text-ios-body font-semibold text-ios-label-primary">{transaction.category}</p>
                      {transaction.description && (
                        <p className="text-ios-footnote text-ios-gray-1 mt-1">{transaction.description}</p>
                      )}
                    </div>
                    <p
                      className={`text-ios-headline font-bold ml-4 ${
                        transaction.type === 'income' ? 'text-ios-green' : 'text-ios-red'
                      }`}
                    >
                      {transaction.type === 'income' ? '+' : '-'}
                      {formatCurrency(transaction.baseAmount, transaction.baseCurrency)}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 text-ios-caption text-ios-gray-2">
                    <span>{formatDateShort(transaction.date)}</span>
                    {transaction.currency !== transaction.baseCurrency && (
                      <span>
                        • {formatCurrency(transaction.amount, transaction.currency)}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </Card>
          )}
        </div>

        {/* Floating Action Button */}
        <FloatingActionButton onClick={() => setShowAddTransaction(true)} />

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
      </div>
    </div>
  )
}

