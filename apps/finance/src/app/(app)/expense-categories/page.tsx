'use client'

import { useState } from 'react'
import { PageHeader, FloatingActionButton, EmptyState, Modal, Plus, TrendingDown } from '@repo/ui'
import { useExpenseCategories, useCreateExpenseCategory, useUpdateExpenseCategory, useDeleteExpenseCategory } from '../../../hooks/use-expense-categories'
import { ExpenseCategoryCard } from '../../../components/expense-categories/ExpenseCategoryCard'
import { ExpenseCategoryForm } from '../../../components/forms/ExpenseCategoryForm'
import type { Account } from '@repo/db'

export default function ExpenseCategoriesPage() {
  const { data: expenseCategories = [], isLoading } = useExpenseCategories()
  const createExpenseCategory = useCreateExpenseCategory()
  const updateExpenseCategory = useUpdateExpenseCategory()
  const deleteExpenseCategory = useDeleteExpenseCategory()

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Account | null>(null)

  const handleCreate = async (data: any) => {
    await createExpenseCategory.mutateAsync(data)
    setIsCreateModalOpen(false)
  }

  const handleUpdate = async (data: any) => {
    if (!editingCategory) return
    await updateExpenseCategory.mutateAsync({ id: editingCategory.id, data })
    setEditingCategory(null)
  }

  const handleDelete = async () => {
    if (!editingCategory) return
    if (!confirm('Are you sure you want to delete this expense category?')) return
    await deleteExpenseCategory.mutateAsync(editingCategory.id)
    setEditingCategory(null)
  }

  if (isLoading) {
    return (
      <div className="p-4">
        <PageHeader title="Expense Categories" />
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
      <PageHeader title="Expense Categories" />

      {expenseCategories.length === 0 ? (
        <div className="mt-12">
          <EmptyState
            icon={TrendingDown}
            title="No Expense Categories Created"
            description="Add your first expense category"
          />
        </div>
      ) : (
        <div className="mt-6 bg-white rounded-ios border border-ios-gray-5 shadow-ios-sm overflow-hidden">
          {expenseCategories.map((category, index) => (
            <ExpenseCategoryCard
              key={category.id}
              expenseCategory={category}
              onClick={() => setEditingCategory(category)}
              isFirst={index === 0}
              isLast={index === expenseCategories.length - 1}
            />
          ))}
        </div>
      )}

      <FloatingActionButton 
        icon={Plus} 
        label="Add Category"
        onClick={() => setIsCreateModalOpen(true)} 
      />

      {/* Create Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Add Expense Category"
      >
        <ExpenseCategoryForm
          onSubmit={handleCreate}
          onCancel={() => setIsCreateModalOpen(false)}
        />
      </Modal>

      {/* Edit Modal */}
      <Modal
        isOpen={!!editingCategory}
        onClose={() => setEditingCategory(null)}
        title="Edit Expense Category"
      >
        {editingCategory && (
          <div className="space-y-4">
            <ExpenseCategoryForm
              initialData={editingCategory}
              onSubmit={handleUpdate}
              onCancel={() => setEditingCategory(null)}
            />
            <button
              onClick={handleDelete}
              className="w-full py-3 text-ios-red font-semibold hover:bg-ios-red/10 rounded-ios transition-colors"
            >
              Delete Expense Category
            </button>
          </div>
        )}
      </Modal>
    </div>
  )
}

