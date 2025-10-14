'use client'

import { useState } from 'react'
import { Plus, Wallet } from 'lucide-react'
import { Container, Stack, ActionIcon, Modal, Title, Text, Group, Paper, Skeleton, Button } from '@mantine/core'
import { useBudgets, useCreateBudget, useUpdateBudget, useDeleteBudget } from '../../../hooks/use-budgets'
import { BudgetCard } from '../../../components/budgets/BudgetCard'
import { BudgetForm } from '../../../components/forms/BudgetForm'
import type { CreateBudgetSchema, UpdateBudgetSchema } from '../../../features/budgets/validation'

interface Budget {
  id: string
  name: string
  amount: string
  currency: string
  startDate: string
  endDate: string
  accounts: Array<{
    accountId: string
    account: {
      id: string
      name: string
      type: string
      currency: string
    }
  }>
}

export default function BudgetsPage() {
  const { data: budgets = [], isLoading } = useBudgets()
  const createBudget = useCreateBudget()
  const updateBudget = useUpdateBudget()
  const deleteBudget = useDeleteBudget()

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null)

  const handleCreate = async (data: CreateBudgetSchema) => {
    await createBudget.mutateAsync(data)
    setIsCreateModalOpen(false)
  }

  const handleUpdate = async (data: UpdateBudgetSchema) => {
    if (!editingBudget) return
    await updateBudget.mutateAsync({ id: editingBudget.id, data })
    setEditingBudget(null)
  }

  const handleDelete = async () => {
    if (!editingBudget) return
    if (!confirm('Are you sure you want to delete this budget?')) return
    await deleteBudget.mutateAsync(editingBudget.id)
    setEditingBudget(null)
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
            <Title order={1} size="h2">Budgets</Title>
            <Text c="dimmed" size="sm">Track your spending limits</Text>
          </div>
        </Group>

        {budgets.length === 0 ? (
          <Stack align="center" gap="md" py="xl" style={{ textAlign: 'center' }}>
            <Wallet size={64} style={{ opacity: 0.3 }} />
            <Title order={3} size="h4">No Budgets Yet</Title>
            <Text c="dimmed">Set your first spending limit!</Text>
          </Stack>
        ) : (
          <Paper withBorder radius="md">
            <Stack gap={0}>
              {budgets.map((budget, index) => (
                <BudgetCard
                  key={budget.id}
                  budget={budget}
                  onClick={() => setEditingBudget(budget)}
                  isFirst={index === 0}
                  isLast={index === budgets.length - 1}
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
        aria-label="Add Budget"
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
        title="Add Budget"
        centered
        size="md"
      >
        <BudgetForm
          onSubmit={handleCreate}
          onCancel={() => setIsCreateModalOpen(false)}
        />
      </Modal>

      <Modal
        opened={!!editingBudget}
        onClose={() => setEditingBudget(null)}
        title="Edit Budget"
        centered
        size="md"
      >
        {editingBudget && (
          <Stack gap="md">
            <BudgetForm
              initialData={{
                id: editingBudget.id,
                name: editingBudget.name,
                amount: Number(editingBudget.amount),
                currency: editingBudget.currency as 'EGP' | 'USD' | 'GOLD',
                startDate: editingBudget.startDate,
                endDate: editingBudget.endDate,
                accountIds: editingBudget.accounts.map(a => a.accountId),
              }}
              onSubmit={handleUpdate}
              onCancel={() => setEditingBudget(null)}
            />
            <Button
              onClick={handleDelete}
              color="red"
              variant="light"
              fullWidth
            >
              Delete Budget
            </Button>
          </Stack>
        )}
      </Modal>
    </Container>
  )
}
