'use client'

import { useState } from 'react'
import { FloatingActionButton, Modal, Plus, TrendingUp, PageLayout, EntityList, LoadingSkeleton } from '@repo/ui'
import { useIncomeSources, useCreateIncomeSource, useUpdateIncomeSource, useDeleteIncomeSource } from '../../../hooks/use-income-sources'
import { IncomeSourceCard } from '../../../components/income-sources/IncomeSourceCard'
import { IncomeSourceForm } from '../../../components/forms/IncomeSourceForm'
import type { Account } from '@repo/db'
import type { CreateIncomeSourceSchema, UpdateIncomeSourceSchema } from '../../../features/accounts/income/validation'

export default function IncomeSourcesPage() {
  const { data: incomeSources = [], isLoading } = useIncomeSources()
  const createIncomeSource = useCreateIncomeSource()
  const updateIncomeSource = useUpdateIncomeSource()
  const deleteIncomeSource = useDeleteIncomeSource()

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [editingSource, setEditingSource] = useState<Account | null>(null)

  const handleCreate = async (data: CreateIncomeSourceSchema) => {
    await createIncomeSource.mutateAsync(data)
    setIsCreateModalOpen(false)
  }

  const handleUpdate = async (data: UpdateIncomeSourceSchema) => {
    if (!editingSource) return
    await updateIncomeSource.mutateAsync({ id: editingSource.id, data })
    setEditingSource(null)
  }

  const handleDelete = async () => {
    if (!editingSource) return
    if (!confirm('Are you sure you want to delete this income source?')) return
    await deleteIncomeSource.mutateAsync(editingSource.id)
    setEditingSource(null)
  }

  if (isLoading) {
    return <LoadingSkeleton title="Income Sources" subtitle="Manage your income sources" />
  }

  return (
    <PageLayout title="Income Sources" subtitle="Manage your income sources">
      <EntityList
        items={incomeSources}
        emptyIcon={TrendingUp}
        emptyTitle="No Income Sources Added"
        emptyDescription="Add your first income source"
        renderItem={(source, index) => (
          <IncomeSourceCard
            key={source.id}
            incomeSource={source}
            onClick={() => setEditingSource(source)}
            isFirst={index === 0}
            isLast={index === incomeSources.length - 1}
          />
        )}
      />

      <FloatingActionButton 
        icon={Plus} 
        label="Add Income Source"
        onClick={() => setIsCreateModalOpen(true)}
        className="fixed bottom-20 right-4"
      />

      {/* Create Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Add Income Source"
      >
        <IncomeSourceForm
          onSubmit={handleCreate}
          onCancel={() => setIsCreateModalOpen(false)}
        />
      </Modal>

      {/* Edit Modal */}
      <Modal
        isOpen={!!editingSource}
        onClose={() => setEditingSource(null)}
        title="Edit Income Source"
      >
        {editingSource && (
          <div className="space-y-4">
            <IncomeSourceForm
              initialData={{
                ...editingSource,
                description: editingSource.description || undefined,
              }}
              onSubmit={handleUpdate}
              onCancel={() => setEditingSource(null)}
            />
            <button
              onClick={handleDelete}
              className="w-full py-3 text-ios-red font-semibold hover:bg-ios-red/10 rounded-ios transition-colors"
            >
              Delete Income Source
            </button>
          </div>
        )}
      </Modal>
    </PageLayout>
  )
}
