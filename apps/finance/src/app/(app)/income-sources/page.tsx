'use client'

import { useState } from 'react'
import { Plus, TrendingUp } from 'lucide-react'
import { Container, Stack, ActionIcon, Modal, Title, Text, Group, Paper, Skeleton, Button } from '@mantine/core'
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
    return (
      <Container size="lg" py="md" px="md" pb={96}>
        <Stack gap="md">
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
        <Group justify="space-between" align="flex-start">
          <div>
            <Title order={1} size="h2">Income Sources</Title>
            <Text c="dimmed" size="sm">Manage your income sources</Text>
          </div>
        </Group>

        {incomeSources.length === 0 ? (
          <Stack align="center" gap="md" py="xl" style={{ textAlign: 'center' }}>
            <TrendingUp size={64} style={{ opacity: 0.3 }} />
            <Title order={3} size="h4">No Income Sources Created</Title>
            <Text c="dimmed">Add your first income source</Text>
          </Stack>
        ) : (
          <Paper withBorder radius="md">
            <Stack gap={0}>
              {incomeSources.map((source, index) => (
                <IncomeSourceCard
                  key={source.id}
                  incomeSource={source}
                  onClick={() => setEditingSource(source)}
                  isFirst={index === 0}
                  isLast={index === incomeSources.length - 1}
                />
              ))}
            </Stack>
          </Paper>
        )}
      </Stack>

      <ActionIcon
        onClick={() => setIsCreateModalOpen(true)}
        size="xl"
        radius="xl"
        variant="filled"
        color="blue"
        aria-label="Add Income Source"
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

      <Modal
        opened={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Add Income Source"
        centered
        size="md"
      >
        <IncomeSourceForm
          onSubmit={handleCreate}
          onCancel={() => setIsCreateModalOpen(false)}
        />
      </Modal>

      <Modal
        opened={!!editingSource}
        onClose={() => setEditingSource(null)}
        title="Edit Income Source"
        centered
        size="md"
      >
        {editingSource && (
          <Stack gap="md">
            <IncomeSourceForm
              initialData={{
                ...editingSource,
                description: editingSource.description || undefined,
                openingBalance: Number(editingSource.balance),
              }}
              onSubmit={handleUpdate}
              onCancel={() => setEditingSource(null)}
            />
            <Button
              onClick={handleDelete}
              color="red"
              variant="light"
              fullWidth
            >
              Delete Income Source
            </Button>
          </Stack>
        )}
      </Modal>
    </Container>
  )
}
