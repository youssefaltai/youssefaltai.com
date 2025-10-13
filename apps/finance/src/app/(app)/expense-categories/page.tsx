'use client'

import { useState } from 'react'
import { FloatingActionButton, Modal, Plus, TrendingDown, PageLayout, EntityList, LoadingSkeleton } from '@repo/ui'
import { useExpenseCategories, useCreateExpenseCategory, useUpdateExpenseCategory, useDeleteExpenseCategory } from '../../../hooks/use-expense-categories'
import { ExpenseCategoryCard } from '../../../components/expense-categories/ExpenseCategoryCard'
import { ExpenseCategoryForm } from '../../../components/forms/ExpenseCategoryForm'
import type { Account } from '@repo/db'
import type { CreateExpenseCategorySchema, UpdateExpenseCategorySchema } from '../../../features/accounts/expense/validation'

export default function ExpenseCategoriesPage() {
  const { data: expenseCategories = [], isLoading } = useExpenseCategories()
  const createExpenseCategory = useCreateExpenseCategory()
  const updateExpenseCategory = useUpdateExpenseCategory()
  const deleteExpenseCategory = useDeleteExpenseCategory()

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Account | null>(null)

  const handleCreate = async (data: CreateExpenseCategorySchema) => {
    await createExpenseCategory.mutateAsync(data)
    setIsCreateModalOpen(false)
  }

  const handleUpdate = async (data: UpdateExpenseCategorySchema) => {
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
    return <LoadingSkeleton title="Expense Categories" subtitle="Manage your spending categories" />
  }

  return (
    <PageLayout title="Expense Categories" subtitle="Manage your spending categories">
      <EntityList
        items={expenseCategories}
        emptyIcon={TrendingDown}
        emptyTitle="No Expense Categories Created"
        emptyDescription="Add your first expense category"
        renderItem={(category, index) => (
          <ExpenseCategoryCard
            key={category.id}
            expenseCategory={category}
            onClick={() => setEditingCategory(category)}
            isFirst={index === 0}
            isLast={index === expenseCategories.length - 1}
          />
        )}
      />

      <FloatingActionButton 
        icon={Plus} 
        label="Add Category"
        onClick={() => setIsCreateModalOpen(true)}
        className="fixed bottom-20 right-4"
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
              initialData={{
                ...editingCategory,
                description: editingCategory.description || undefined,
              }}
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
    </PageLayout>
  )
}
