'use client'

import { formatCurrency, formatDateShort, formatDateTime, formatRelative } from '@repo/utils'
import { useDeleteTransaction } from '../../hooks/useDeleteTransaction'

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

interface TransactionListProps {
  transactions: Transaction[]
}

export function TransactionList({ transactions }: TransactionListProps) {
  const deleteTransaction = useDeleteTransaction()

  const handleDelete = (id: string) => {
    if (!confirm('Are you sure you want to delete this transaction?')) {
      return
    }

    deleteTransaction.mutate(id, {
      onError: (error) => {
        alert(error.message || 'Failed to delete transaction')
      },
    })
  }

  // Removed - using imported formatDateShort instead

  if (transactions.length === 0) {
    return (
      <div className="p-12 text-center text-ios-gray-2">
        <svg className="w-16 h-16 mx-auto text-ios-gray-3 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <p className="text-ios-body font-medium text-ios-label-primary">No transactions yet</p>
        <p className="text-ios-footnote mt-1">Start by adding your first transaction</p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-ios-gray-6">
          <tr>
            <th className="px-6 py-3 text-left text-ios-footnote font-medium text-ios-gray-1 uppercase tracking-wider">
              Date
            </th>
            <th className="px-6 py-3 text-left text-ios-footnote font-medium text-ios-gray-1 uppercase tracking-wider">
              Category
            </th>
            <th className="px-6 py-3 text-left text-ios-footnote font-medium text-ios-gray-1 uppercase tracking-wider">
              Description
            </th>
            <th className="px-6 py-3 text-right text-ios-footnote font-medium text-ios-gray-1 uppercase tracking-wider">
              Original Amount
            </th>
            <th className="px-6 py-3 text-right text-ios-footnote font-medium text-ios-gray-1 uppercase tracking-wider">
              Base Amount
            </th>
            <th className="px-6 py-3 text-center text-ios-footnote font-medium text-ios-gray-1 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-ios-gray-5">
          {transactions.map((transaction) => (
            <tr key={transaction.id} className="hover:bg-ios-gray-6 transition">
              <td className="px-6 py-4 whitespace-nowrap text-ios-callout">
                <div className="text-ios-label-primary">{formatDateShort(transaction.date)}</div>
                <div className="text-ios-caption text-ios-gray-1" title={formatDateTime(transaction.date)}>
                  {formatRelative(transaction.date)}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-ios-caption font-medium bg-ios-blue/10 text-ios-blue">
                  {transaction.category}
                </span>
              </td>
              <td className="px-6 py-4 text-ios-callout text-ios-gray-1">
                {transaction.description || '-'}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-ios-callout text-right">
                <span className={`font-medium ${transaction.type === 'income' ? 'text-ios-green' : 'text-ios-red'}`}>
                  {transaction.type === 'income' ? '+' : '-'}
                  {formatCurrency(transaction.amount, transaction.currency)}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-ios-callout text-right text-ios-label-primary">
                {formatCurrency(transaction.baseAmount, transaction.baseCurrency)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-center text-ios-callout">
                <button
                  onClick={() => handleDelete(transaction.id)}
                  disabled={deleteTransaction.isPending}
                  className="text-ios-red hover:text-ios-red/80 disabled:text-ios-gray-3 transition p-2 -m-2"
                  title="Delete transaction"
                >
                  {deleteTransaction.isPending ? (
                    <svg className="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  )}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
