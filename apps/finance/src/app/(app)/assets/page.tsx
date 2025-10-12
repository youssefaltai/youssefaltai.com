'use client'

import { useState } from 'react'
import { PageHeader, FloatingActionButton, EmptyState, Modal, Plus, Wallet } from '@repo/ui'
import { useAssets, useCreateAsset, useUpdateAsset, useDeleteAsset } from '../../../hooks/use-assets'
import { AssetCard } from '../../../components/assets/AssetCard'
import { AssetForm } from '../../../components/forms/AssetForm'
import type { Account } from '@repo/db'

export default function AssetsPage() {
  const { data: assets = [], isLoading } = useAssets()
  const createAsset = useCreateAsset()
  const updateAsset = useUpdateAsset()
  const deleteAsset = useDeleteAsset()

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [editingAsset, setEditingAsset] = useState<Account | null>(null)

  const handleCreate = async (data: any) => {
    await createAsset.mutateAsync(data)
    setIsCreateModalOpen(false)
  }

  const handleUpdate = async (data: any) => {
    if (!editingAsset) return
    await updateAsset.mutateAsync({ id: editingAsset.id, data })
    setEditingAsset(null)
  }

  const handleDelete = async () => {
    if (!editingAsset) return
    if (!confirm('Are you sure you want to delete this asset?')) return
    await deleteAsset.mutateAsync(editingAsset.id)
    setEditingAsset(null)
  }

  if (isLoading) {
    return (
      <div className="p-4">
        <PageHeader title="Assets" />
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
      <PageHeader title="Assets" />

      {assets.length === 0 ? (
        <div className="mt-12">
          <EmptyState
            icon={Wallet}
            title="No Assets Yet"
            description="Add your first asset to get started!"
          />
        </div>
      ) : (
        <div className="mt-6 bg-white rounded-ios border border-ios-gray-5 shadow-ios-sm overflow-hidden">
          {assets.map((asset, index) => (
            <AssetCard
              key={asset.id}
              asset={asset}
              onClick={() => setEditingAsset(asset)}
              isFirst={index === 0}
              isLast={index === assets.length - 1}
            />
          ))}
        </div>
      )}

      <FloatingActionButton 
        icon={Plus} 
        label="Add Asset"
        onClick={() => setIsCreateModalOpen(true)} 
      />

      {/* Create Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Add Asset"
      >
        <AssetForm
          onSubmit={handleCreate}
          onCancel={() => setIsCreateModalOpen(false)}
        />
      </Modal>

      {/* Edit Modal */}
      <Modal
        isOpen={!!editingAsset}
        onClose={() => setEditingAsset(null)}
        title="Edit Asset"
      >
        {editingAsset && (
          <div className="space-y-4">
            <AssetForm
              initialData={editingAsset}
              onSubmit={handleUpdate}
              onCancel={() => setEditingAsset(null)}
            />
            <button
              onClick={handleDelete}
              className="w-full py-3 text-ios-red font-semibold hover:bg-ios-red/10 rounded-ios transition-colors"
            >
              Delete Asset
            </button>
          </div>
        )}
      </Modal>
    </div>
  )
}

