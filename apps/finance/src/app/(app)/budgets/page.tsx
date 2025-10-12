'use client'

import { useState } from 'react'
import { FloatingActionButton, Modal, Plus, Wallet, PageLayout, EntityList, LoadingSkeleton } from '@repo/ui'
import { useBudgets, useCreateBudget, useUpdateBudget, useDeleteBudget } from '../../../hooks/use-budgets'
import { BudgetCard } from '../../../components/budgets/BudgetCard'
import { BudgetForm } from '../../../components/forms/BudgetForm'
import type { CreateBudgetSchema, UpdateBudgetSchema } from '../../../features/budgets/validation'

interface Budget {
  id: string
  name: string
  amount: string
  currency: string
  startDate: string
  endDate: string
  accounts: Array<{
    accountId: string
    account: {
      id: string
      name: string
      type: string
      currency: string
    }
  }>
}

export default function BudgetsPage() {
  const { data: budgets = [], isLoading } = useBudgets()
  const createBudget = useCreateBudget()
  const updateBudget = useUpdateBudget()
  const deleteBudget = useDeleteBudget()

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null)

  const handleCreate = async (data: CreateBudgetSchema) => {
    await createBudget.mutateAsync(data)
    setIsCreateModalOpen(false)
  }

  const handleUpdate = async (data: UpdateBudgetSchema) => {
    if (!editingBudget) return
    await updateBudget.mutateAsync({ id: editingBudget.id, data })
    setEditingBudget(null)
  }

  const handleDelete = async () => {
    if (!editingBudget) return
    if (!confirm('Are you sure you want to delete this budget?')) return
    await deleteBudget.mutateAsync(editingBudget.id)
    setEditingBudget(null)
  }

  if (isLoading) {
    return <LoadingSkeleton title="Budgets" subtitle="Track your spending limits" itemHeight={40} />
  }

  return (
    <PageLayout title="Budgets" subtitle="Track your spending limits">
      <EntityList
        items={budgets}
        emptyIcon={Wallet}
        emptyTitle="No Budgets Yet"
        emptyDescription="Set your first spending limit!"
        renderItem={(budget, index) => (
          <BudgetCard
            key={budget.id}
            budget={budget}
            onClick={() => setEditingBudget(budget)}
            isFirst={index === 0}
            isLast={index === budgets.length - 1}
          />
        )}
      />

      <FloatingActionButton
        icon={Plus}
        label="Add Budget"
        onClick={() => setIsCreateModalOpen(true)}
        className="fixed bottom-20 right-4"
      />

      {/* Create Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Add Budget"
      >
        <BudgetForm
          onSubmit={handleCreate}
          onCancel={() => setIsCreateModalOpen(false)}
        />
      </Modal>

      {/* Edit Modal */}
      <Modal
        isOpen={!!editingBudget}
        onClose={() => setEditingBudget(null)}
        title="Edit Budget"
      >
        {editingBudget && (
          <div className="space-y-4">
            <BudgetForm
              initialData={{
                id: editingBudget.id,
                name: editingBudget.name,
                amount: Number(editingBudget.amount),
                currency: editingBudget.currency as 'EGP' | 'USD' | 'GOLD',
                startDate: editingBudget.startDate,
                endDate: editingBudget.endDate,
                accountIds: editingBudget.accounts.map(a => a.accountId),
              }}
              onSubmit={handleUpdate}
              onCancel={() => setEditingBudget(null)}
            />
            <button
              onClick={handleDelete}
              className="w-full py-3 text-ios-red font-semibold hover:bg-ios-red/10 rounded-ios transition-colors"
            >
              Delete Budget
            </button>
          </div>
        )}
      </Modal>
    </PageLayout>
  )
}
