'use client'

import { useState } from 'react'
import { PageHeader, FloatingActionButton, EmptyState, Modal, Plus, TrendingUp } from '@repo/ui'
import { useIncomeSources, useCreateIncomeSource, useUpdateIncomeSource, useDeleteIncomeSource } from '../../../hooks/use-income-sources'
import { IncomeSourceCard } from '../../../components/income-sources/IncomeSourceCard'
import { IncomeSourceForm } from '../../../components/forms/IncomeSourceForm'
import type { Account } from '@repo/db'

export default function IncomeSourcesPage() {
  const { data: incomeSources = [], isLoading } = useIncomeSources()
  const createIncomeSource = useCreateIncomeSource()
  const updateIncomeSource = useUpdateIncomeSource()
  const deleteIncomeSource = useDeleteIncomeSource()

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [editingSource, setEditingSource] = useState<Account | null>(null)

  const handleCreate = async (data: any) => {
    await createIncomeSource.mutateAsync(data)
    setIsCreateModalOpen(false)
  }

  const handleUpdate = async (data: any) => {
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
    return (
      <div className="p-4">
        <PageHeader title="Income Sources" />
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
      <PageHeader title="Income Sources" />

      {incomeSources.length === 0 ? (
        <div className="mt-12">
          <EmptyState
            icon={TrendingUp}
            title="No Income Sources Added"
            description="Add your first income source"
          />
        </div>
      ) : (
        <div className="mt-6 bg-white rounded-ios border border-ios-gray-5 shadow-ios-sm overflow-hidden">
          {incomeSources.map((source, index) => (
            <IncomeSourceCard
              key={source.id}
              incomeSource={source}
              onClick={() => setEditingSource(source)}
              isFirst={index === 0}
              isLast={index === incomeSources.length - 1}
            />
          ))}
        </div>
      )}

      <FloatingActionButton 
        icon={Plus} 
        label="Add Income Source"
        onClick={() => setIsCreateModalOpen(true)} 
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
              initialData={editingSource}
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
    </div>
  )
}

