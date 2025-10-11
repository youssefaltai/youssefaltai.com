'use client'

import { useState } from 'react'
import { Card, FloatingActionButton, Plus, PageHeader, EmptyState, Modal, Wallet, Trash2, Edit2 } from '@repo/ui'
import { useCategories } from '@/features/categories/hooks/useCategories'
import { useDeleteCategory } from '@/features/categories/hooks/useDeleteCategory'
import { CategoryForm } from '@/features/categories/components/CategoryForm'
import type { Category } from '@repo/types'

export default function CategoriesPage() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const { data: categories = [] } = useCategories()
  const deleteCategory = useDeleteCategory()

  const incomeCategories = categories.filter((cat) => cat.type === 'income')
  const expenseCategories = categories.filter((cat) => cat.type === 'expense')

  const handleDelete = (categoryId: string, categoryName: string) => {
    if (confirm(`Are you sure you want to delete "${categoryName}"?`)) {
      deleteCategory.mutate(categoryId)
    }
  }

  const handleEdit = (category: Category) => {
    setEditingCategory(category)
    setIsModalOpen(true)
  }

  const handleModalClose = () => {
    setIsModalOpen(false)
    setEditingCategory(null)
  }

  return (
    <>
      <PageHeader title="Categories" subtitle="Manage your transaction categories" />

      <div className="p-4 space-y-6">
        {/* Expense Categories */}
        <div>
          <h2 className="text-ios-headline font-semibold text-ios-label-primary mb-3">
            Expense Categories
          </h2>
          {expenseCategories.length === 0 ? (
            <EmptyState
              icon={Wallet}
              title="No expense categories"
              description="Create your first expense category"
            />
          ) : (
            <Card padding="none">
              {expenseCategories.map((category, index) => (
                <div
                  key={category.id}
                  className={`flex items-center justify-between p-4 ${
                    index !== expenseCategories.length - 1 ? 'border-b border-ios-gray-5' : ''
                  }`}
                >
                  <div>
                    <p className="text-ios-body font-medium text-ios-label-primary">
                      {category.name}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleEdit(category)}
                      className="p-2 rounded-full hover:bg-ios-blue/10 transition-colors"
                      aria-label="Edit category"
                    >
                      <Edit2 className="w-5 h-5 text-ios-blue" />
                    </button>
                    <button
                      onClick={() => handleDelete(category.id, category.name)}
                      className="p-2 rounded-full hover:bg-ios-red/10 transition-colors"
                      aria-label="Delete category"
                    >
                      <Trash2 className="w-5 h-5 text-ios-red" />
                    </button>
                  </div>
                </div>
              ))}
            </Card>
          )}
        </div>

        {/* Income Categories */}
        <div>
          <h2 className="text-ios-headline font-semibold text-ios-label-primary mb-3">
            Income Categories
          </h2>
          {incomeCategories.length === 0 ? (
            <EmptyState
              icon={Wallet}
              title="No income categories"
              description="Create your first income category"
            />
          ) : (
            <Card padding="none">
              {incomeCategories.map((category, index) => (
                <div
                  key={category.id}
                  className={`flex items-center justify-between p-4 ${
                    index !== incomeCategories.length - 1 ? 'border-b border-ios-gray-5' : ''
                  }`}
                >
                  <div>
                    <p className="text-ios-body font-medium text-ios-label-primary">
                      {category.name}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleEdit(category)}
                      className="p-2 rounded-full hover:bg-ios-blue/10 transition-colors"
                      aria-label="Edit category"
                    >
                      <Edit2 className="w-5 h-5 text-ios-blue" />
                    </button>
                    <button
                      onClick={() => handleDelete(category.id, category.name)}
                      className="p-2 rounded-full hover:bg-ios-red/10 transition-colors"
                      aria-label="Delete category"
                    >
                      <Trash2 className="w-5 h-5 text-ios-red" />
                    </button>
                  </div>
                </div>
              ))}
            </Card>
          )}
        </div>
      </div>

      {/* Floating Action Button */}
      <FloatingActionButton
        icon={Plus}
        onClick={() => setIsModalOpen(true)}
        label="Add category"
        className="fixed bottom-20 right-6 z-40"
      />

      {/* Add/Edit Category Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        title={editingCategory ? 'Edit Category' : 'Create Category'}
      >
        <CategoryForm
          category={editingCategory || undefined}
          onSuccess={handleModalClose}
          onCancel={handleModalClose}
        />
      </Modal>
    </>
  )
}

