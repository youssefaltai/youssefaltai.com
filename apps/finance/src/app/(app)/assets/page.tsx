'use client'

import { useState } from 'react'
import { FloatingActionButton, Modal, Plus, Wallet } from '@repo/ui'
import { useAssets, useCreateAsset, useUpdateAsset, useDeleteAsset } from '../../../hooks/use-assets'
import { AssetCard } from '../../../components/assets/AssetCard'
import { AssetForm } from '../../../components/forms/AssetForm'
import { PageLayout } from '../../../components/shared/PageLayout'
import { EntityList } from '../../../components/shared/EntityList'
import { LoadingSkeleton } from '../../../components/shared/LoadingSkeleton'
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
    return <LoadingSkeleton title="Assets" subtitle="Manage your assets and accounts" />
  }

  return (
    <PageLayout title="Assets" subtitle="Manage your assets and accounts">
      <EntityList
        items={assets}
        emptyIcon={Wallet}
        emptyTitle="No Assets Yet"
        emptyDescription="Add your first asset to get started!"
        renderItem={(asset, index) => (
          <AssetCard
            key={asset.id}
            asset={asset}
            onClick={() => setEditingAsset(asset)}
            isFirst={index === 0}
            isLast={index === assets.length - 1}
          />
        )}
      />

      <FloatingActionButton 
        icon={Plus} 
        label="Add Asset"
        onClick={() => setIsCreateModalOpen(true)}
        className="fixed bottom-20 right-4"
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
              initialData={{
                ...editingAsset,
                description: editingAsset.description || undefined,
                openingBalance: Number(editingAsset.balance),
              }}
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
    </PageLayout>
  )
}
