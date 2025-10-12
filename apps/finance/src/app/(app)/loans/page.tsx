'use client'

import { useState } from 'react'
import { PageHeader, FloatingActionButton, EmptyState, Modal, Plus, Landmark } from '@repo/ui'
import { useLoans, useCreateLoan, useUpdateLoan, useDeleteLoan } from '../../../hooks/use-loans'
import { LoanCard } from '../../../components/loans/LoanCard'
import { LoanForm } from '../../../components/forms/LoanForm'
import type { Account } from '@repo/db'

export default function LoansPage() {
  const { data: loans = [], isLoading } = useLoans()
  const createLoan = useCreateLoan()
  const updateLoan = useUpdateLoan()
  const deleteLoan = useDeleteLoan()

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [editingLoan, setEditingLoan] = useState<Account | null>(null)

  const handleCreate = async (data: any) => {
    await createLoan.mutateAsync(data)
    setIsCreateModalOpen(false)
  }

  const handleUpdate = async (data: any) => {
    if (!editingLoan) return
    await updateLoan.mutateAsync({ id: editingLoan.id, data })
    setEditingLoan(null)
  }

  const handleDelete = async () => {
    if (!editingLoan) return
    if (!confirm('Are you sure you want to delete this loan?')) return
    await deleteLoan.mutateAsync(editingLoan.id)
    setEditingLoan(null)
  }

  if (isLoading) {
    return (
      <div className="p-4">
        <PageHeader title="Loans" />
        <div className="space-y-3 mt-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 bg-ios-gray-5 rounded-ios animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 pb-24">
      <PageHeader title="Loans" />

      {loans.length === 0 ? (
        <div className="mt-12">
          <EmptyState
            icon={Landmark}
            title="No Loans Tracked"
            description="Add a loan to track payments"
          />
        </div>
      ) : (
        <div className="mt-6 bg-white rounded-ios border border-ios-gray-5 shadow-ios-sm overflow-hidden">
          {loans.map((loan, index) => (
            <LoanCard
              key={loan.id}
              loan={loan}
              onClick={() => setEditingLoan(loan)}
              isFirst={index === 0}
              isLast={index === loans.length - 1}
            />
          ))}
        </div>
      )}

      <FloatingActionButton 
        icon={Plus} 
        label="Add Loan"
        onClick={() => setIsCreateModalOpen(true)} 
      />

      {/* Create Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Add Loan"
      >
        <LoanForm
          onSubmit={handleCreate}
          onCancel={() => setIsCreateModalOpen(false)}
        />
      </Modal>

      {/* Edit Modal */}
      <Modal
        isOpen={!!editingLoan}
        onClose={() => setEditingLoan(null)}
        title="Edit Loan"
      >
        {editingLoan && (
          <div className="space-y-4">
            <LoanForm
              initialData={editingLoan}
              onSubmit={handleUpdate}
              onCancel={() => setEditingLoan(null)}
            />
            <button
              onClick={handleDelete}
              className="w-full py-3 text-ios-red font-semibold hover:bg-ios-red/10 rounded-ios transition-colors"
            >
              Delete Loan
            </button>
          </div>
        )}
      </Modal>
    </div>
  )
}

