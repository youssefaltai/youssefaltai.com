'use client'

import { useState } from 'react'
import { FloatingActionButton, Modal, Plus, Target, PageLayout, EntityList, LoadingSkeleton } from '@repo/ui'
import { useGoals, useCreateGoal, useUpdateGoal, useDeleteGoal } from '../../../hooks/use-goals'
import { GoalCard } from '../../../components/goals/GoalCard'
import { GoalForm } from '../../../components/forms/GoalForm'
import type { Account } from '@repo/db'
import { ensureDate } from '@repo/utils'
import type { CreateGoalSchema, UpdateGoalSchema } from '../../../features/accounts/goal/validation'

export default function GoalsPage() {
  const { data: goals = [], isLoading } = useGoals()
  const createGoal = useCreateGoal()
  const updateGoal = useUpdateGoal()
  const deleteGoal = useDeleteGoal()

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [editingGoal, setEditingGoal] = useState<Account | null>(null)

  const handleCreate = async (data: CreateGoalSchema) => {
    await createGoal.mutateAsync(data)
    setIsCreateModalOpen(false)
  }

  const handleUpdate = async (data: UpdateGoalSchema) => {
    if (!editingGoal) return
    await updateGoal.mutateAsync({ id: editingGoal.id, data })
    setEditingGoal(null)
  }

  const handleDelete = async () => {
    if (!editingGoal) return
    if (!confirm('Are you sure you want to delete this goal?')) return
    await deleteGoal.mutateAsync(editingGoal.id)
    setEditingGoal(null)
  }

  if (isLoading) {
    return <LoadingSkeleton title="Goals" subtitle="Track your financial goals" itemHeight={32} />
  }

  return (
    <PageLayout title="Goals" subtitle="Track your financial goals">
      <EntityList
        items={goals}
        emptyIcon={Target}
        emptyTitle="No Goals Yet"
        emptyDescription="Set your first financial goal!"
        renderItem={(goal, index) => (
          <GoalCard
            key={goal.id}
            goal={goal}
            onClick={() => setEditingGoal(goal)}
            isFirst={index === 0}
            isLast={index === goals.length - 1}
          />
        )}
      />

      <FloatingActionButton
        icon={Plus}
        label="Add Goal"
        onClick={() => setIsCreateModalOpen(true)}
        className="fixed bottom-20 right-4"
      />

      {/* Create Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Add Goal"
      >
        <GoalForm
          onSubmit={handleCreate}
          onCancel={() => setIsCreateModalOpen(false)}
        />
      </Modal>

      {/* Edit Modal */}
      <Modal
        isOpen={!!editingGoal}
        onClose={() => setEditingGoal(null)}
        title="Edit Goal"
      >
        {editingGoal && (
          <div className="space-y-4">
            <GoalForm
              initialData={{
                ...editingGoal,
                description: editingGoal.description || undefined,
                target: editingGoal.target ? Number(editingGoal.target) : 0,
                openingBalance: Number(editingGoal.balance),
                dueDate: ensureDate(editingGoal.dueDate || new Date()).toISOString(),
              }}
              onSubmit={handleUpdate}
              onCancel={() => setEditingGoal(null)}
            />
            <button
              onClick={handleDelete}
              className="w-full py-3 text-ios-red font-semibold hover:bg-ios-red/10 rounded-ios transition-colors"
            >
              Delete Goal
            </button>
          </div>
        )}
      </Modal>
    </PageLayout>
  )
}
