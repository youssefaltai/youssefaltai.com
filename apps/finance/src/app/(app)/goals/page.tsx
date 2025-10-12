'use client'

import { useState } from 'react'
import { PageHeader, FloatingActionButton, EmptyState, Modal, Plus, Target } from '@repo/ui'
import { useGoals, useCreateGoal, useUpdateGoal, useDeleteGoal } from '../../../hooks/use-goals'
import { GoalCard } from '../../../components/goals/GoalCard'
import { GoalForm } from '../../../components/forms/GoalForm'
import type { Account } from '@repo/db'

export default function GoalsPage() {
  const { data: goals = [], isLoading } = useGoals()
  const createGoal = useCreateGoal()
  const updateGoal = useUpdateGoal()
  const deleteGoal = useDeleteGoal()

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [editingGoal, setEditingGoal] = useState<Account | null>(null)

  const handleCreate = async (data: any) => {
    await createGoal.mutateAsync(data)
    setIsCreateModalOpen(false)
  }

  const handleUpdate = async (data: any) => {
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
    return (
      <div className="p-4">
        <PageHeader title="Goals" />
        <div className="space-y-3 mt-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 bg-ios-gray-5 rounded-ios animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 pb-24">
      <PageHeader title="Goals" />

      {goals.length === 0 ? (
        <div className="mt-12">
          <EmptyState
            icon={Target}
            title="No Goals Yet"
            description="Set your first financial goal!"
          />
        </div>
      ) : (
        <div className="mt-6 bg-white rounded-ios border border-ios-gray-5 shadow-ios-sm overflow-hidden">
          {goals.map((goal, index) => (
            <GoalCard
              key={goal.id}
              goal={goal}
              onClick={() => setEditingGoal(goal)}
              isFirst={index === 0}
              isLast={index === goals.length - 1}
            />
          ))}
        </div>
      )}

      <FloatingActionButton 
        icon={Plus} 
        label="Add Goal"
        onClick={() => setIsCreateModalOpen(true)} 
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
              initialData={editingGoal}
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
    </div>
  )
}
