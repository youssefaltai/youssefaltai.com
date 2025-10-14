'use client'

import { useState } from 'react'
import { Plus, Target } from 'lucide-react'
import { Container, Stack, ActionIcon, Modal, Title, Text, Group, Paper, Skeleton, Button } from '@mantine/core'
import { useGoals, useCreateGoal, useUpdateGoal, useDeleteGoal } from '../../../hooks/use-goals'
import { GoalCard } from '../../../components/goals/GoalCard'
import { GoalForm } from '../../../components/forms/GoalForm'
import type { Account } from '@repo/db'
import type { CreateGoalSchema, UpdateGoalSchema } from '../../../features/accounts/goal/validation'

export default function GoalsPage() {
  const { data: goals = [], isLoading } = useGoals()
  const createGoal = useCreateGoal()
  const updateGoal = useUpdateGoal()
  const deleteGoal = useDeleteGoal()

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [editingGoal, setEditingGoal] = useState<Account | null>(null)

  const handleCreate = async (data: CreateGoalSchema) => {
    await createGoal.mutateAsync(data)
    setIsCreateModalOpen(false)
  }

  const handleUpdate = async (data: UpdateGoalSchema) => {
    if (!editingGoal) return
    await updateGoal.mutateAsync({ id: editingGoal.id, data })
    setEditingGoal(null)
  }

  const handleDelete = async () => {
    if (!editingGoal) return
    if (!confirm('Are you sure you want to delete this goal?')) return
    await deleteGoal.mutateAsync(editingGoal.id)
    setEditingGoal(null)
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
            <Title order={1} size="h2">Goals</Title>
            <Text c="dimmed" size="sm">Track your financial goals</Text>
          </div>
        </Group>

        {goals.length === 0 ? (
          <Stack align="center" gap="md" py="xl" style={{ textAlign: 'center' }}>
            <Target size={64} style={{ opacity: 0.3 }} />
            <Title order={3} size="h4">No Goals Yet</Title>
            <Text c="dimmed">Set your first financial goal!</Text>
          </Stack>
        ) : (
          <Paper withBorder radius="md">
            <Stack gap={0}>
              {goals.map((goal, index) => (
                <GoalCard
                  key={goal.id}
                  goal={goal}
                  onClick={() => setEditingGoal(goal)}
                  isFirst={index === 0}
                  isLast={index === goals.length - 1}
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
        aria-label="Add Goal"
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
        title="Add Goal"
        centered
        size="md"
      >
        <GoalForm
          onSubmit={handleCreate}
          onCancel={() => setIsCreateModalOpen(false)}
        />
      </Modal>

      <Modal
        opened={!!editingGoal}
        onClose={() => setEditingGoal(null)}
        title="Edit Goal"
        centered
        size="md"
      >
        {editingGoal && (
          <Stack gap="md">
            <GoalForm
              initialData={{
                name: editingGoal.name,
                currency: editingGoal.currency,
                target: editingGoal.target ? Number(editingGoal.target) : 0,
                dueDate: typeof editingGoal.dueDate === 'string' 
                  ? editingGoal.dueDate 
                  : editingGoal.dueDate 
                    ? new Date(editingGoal.dueDate).toISOString()
                    : new Date().toISOString(),
                description: editingGoal.description || undefined,
                openingBalance: Number(editingGoal.balance),
              }}
              onSubmit={handleUpdate}
              onCancel={() => setEditingGoal(null)}
            />
            <Button
              onClick={handleDelete}
              color="red"
              variant="light"
              fullWidth
            >
              Delete Goal
            </Button>
          </Stack>
        )}
      </Modal>
    </Container>
  )
}
