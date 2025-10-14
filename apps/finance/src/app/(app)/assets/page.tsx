'use client'

import { useState } from 'react'
import { Plus, Wallet } from 'lucide-react'
import { Container, Stack, ActionIcon, Modal, Title, Text, Group, Paper, Skeleton, Button } from '@mantine/core'
import { useAssets, useCreateAsset, useUpdateAsset, useDeleteAsset } from '../../../hooks/use-assets'
import { AssetCard } from '../../../components/assets/AssetCard'
import { AssetForm } from '../../../components/forms/AssetForm'
import type { Account } from '@repo/db'
import type { CreateAssetAccountSchema, UpdateAssetAccountSchema } from '../../../features/accounts/asset/validation'

export default function AssetsPage() {
  const { data: assets = [], isLoading } = useAssets()
  const createAsset = useCreateAsset()
  const updateAsset = useUpdateAsset()
  const deleteAsset = useDeleteAsset()

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [editingAsset, setEditingAsset] = useState<Account | null>(null)

  const handleCreate = async (data: CreateAssetAccountSchema) => {
    await createAsset.mutateAsync(data)
    setIsCreateModalOpen(false)
  }

  const handleUpdate = async (data: UpdateAssetAccountSchema) => {
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
      <Container size="lg" py="md" px="md" pb={96}>
        <Stack gap="md">
          <Skeleton height={80} radius="md" />
          <Skeleton height={80} radius="md" />
          <Skeleton height={80} radius="md" />
          <Skeleton height={80} radius="md" />
        </Stack>
      </Container>
    )
  }

  return (
    <Container size="lg" py="md" px="md" pb={96}>
      <Stack gap="md">
        {/* Header */}
        <Group justify="space-between" align="flex-start">
          <div>
            <Title order={1} size="h2">Assets</Title>
            <Text c="dimmed" size="sm">Manage your assets and accounts</Text>
          </div>
        </Group>

        {/* Content */}
        {assets.length === 0 ? (
          <Stack align="center" gap="md" py="xl" style={{ textAlign: 'center' }}>
            <Wallet size={64} style={{ opacity: 0.3 }} />
            <Title order={3} size="h4">No Assets Yet</Title>
            <Text c="dimmed">Add your first asset to get started!</Text>
          </Stack>
        ) : (
          <Paper withBorder radius="md">
            <Stack gap={0}>
              {assets.map((asset, index) => (
                <AssetCard
                  key={asset.id}
                  asset={asset}
                  onClick={() => setEditingAsset(asset)}
                  isFirst={index === 0}
                  isLast={index === assets.length - 1}
                />
              ))}
            </Stack>
          </Paper>
        )}
      </Stack>

      {/* Floating Action Button */}
      <ActionIcon
        onClick={() => setIsCreateModalOpen(true)}
        size="xl"
        radius="xl"
        variant="filled"
        color="blue"
        aria-label="Add Asset"
        style={{
          position: 'fixed',
          bottom: '5rem',
          right: '1rem',
          width: '56px',
          height: '56px',
          zIndex: 100,
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
        }}
      >
        <Plus size={24} />
      </ActionIcon>

      {/* Create Modal */}
      <Modal
        opened={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Add Asset"
        centered
        size="md"
      >
        <AssetForm
          onSubmit={handleCreate}
          onCancel={() => setIsCreateModalOpen(false)}
        />
      </Modal>

      {/* Edit Modal */}
      <Modal
        opened={!!editingAsset}
        onClose={() => setEditingAsset(null)}
        title="Edit Asset"
        centered
        size="md"
      >
        {editingAsset && (
          <Stack gap="md">
            <AssetForm
              initialData={{
                ...editingAsset,
                description: editingAsset.description || undefined,
                openingBalance: Number(editingAsset.balance),
              }}
              onSubmit={handleUpdate}
              onCancel={() => setEditingAsset(null)}
            />
            <Button
              onClick={handleDelete}
              color="red"
              variant="light"
              fullWidth
            >
              Delete Asset
            </Button>
          </Stack>
        )}
      </Modal>
    </Container>
  )
}
