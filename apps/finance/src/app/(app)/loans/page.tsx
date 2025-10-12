'use client'

import { useState } from 'react'
import { FloatingActionButton, Modal, Plus, Landmark } from '@repo/ui'
import { useLoans, useCreateLoan, useUpdateLoan, useDeleteLoan } from '../../../hooks/use-loans'
import { LoanCard } from '../../../components/loans/LoanCard'
import { LoanForm } from '../../../components/forms/LoanForm'
import { PageLayout } from '../../../components/shared/PageLayout'
import { EntityList } from '../../../components/shared/EntityList'
import { LoadingSkeleton } from '../../../components/shared/LoadingSkeleton'
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
    return <LoadingSkeleton title="Loans" subtitle="Track debts and payments" />
  }

  return (
    <PageLayout title="Loans" subtitle="Track debts and payments">
      <EntityList
        items={loans}
        emptyIcon={Landmark}
        emptyTitle="No Loans Tracked"
        emptyDescription="Add a loan to track payments"
        renderItem={(loan, index) => (
          <LoanCard
            key={loan.id}
            loan={loan}
            onClick={() => setEditingLoan(loan)}
            isFirst={index === 0}
            isLast={index === loans.length - 1}
          />
        )}
      />

      <FloatingActionButton 
        icon={Plus} 
        label="Add Loan"
        onClick={() => setIsCreateModalOpen(true)}
        className="fixed bottom-20 right-4"
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
              initialData={{
                ...editingLoan,
                description: editingLoan.description || undefined,
                openingBalance: Number(editingLoan.balance),
                dueDate: editingLoan.dueDate?.toISOString(),
              }}
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
    </PageLayout>
  )
}
