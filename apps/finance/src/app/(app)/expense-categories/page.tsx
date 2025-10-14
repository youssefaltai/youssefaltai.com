'use client'

import { useState } from 'react'
import { Plus, TrendingDown } from 'lucide-react'
import { Container, Stack, ActionIcon, Modal, Title, Text, Group, Paper, Skeleton, Button } from '@mantine/core'
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
            <Title order={1} size="h2">Expense Categories</Title>
            <Text c="dimmed" size="sm">Manage your spending categories</Text>
          </div>
        </Group>

        {expenseCategories.length === 0 ? (
          <Stack align="center" gap="md" py="xl" style={{ textAlign: 'center' }}>
            <TrendingDown size={64} style={{ opacity: 0.3 }} />
            <Title order={3} size="h4">No Expense Categories Created</Title>
            <Text c="dimmed">Add your first expense category</Text>
          </Stack>
        ) : (
          <Paper withBorder radius="md">
            <Stack gap={0}>
              {expenseCategories.map((category, index) => (
                <ExpenseCategoryCard
                  key={category.id}
                  expenseCategory={category}
                  onClick={() => setEditingCategory(category)}
                  isFirst={index === 0}
                  isLast={index === expenseCategories.length - 1}
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
        aria-label="Add Expense Category"
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
        title="Add Expense Category"
        centered
        size="md"
      >
        <ExpenseCategoryForm
          onSubmit={handleCreate}
          onCancel={() => setIsCreateModalOpen(false)}
        />
      </Modal>

      <Modal
        opened={!!editingCategory}
        onClose={() => setEditingCategory(null)}
        title="Edit Expense Category"
        centered
        size="md"
      >
        {editingCategory && (
          <Stack gap="md">
            <ExpenseCategoryForm
              initialData={{
                ...editingCategory,
                description: editingCategory.description || undefined,
                openingBalance: Number(editingCategory.balance),
              }}
              onSubmit={handleUpdate}
              onCancel={() => setEditingCategory(null)}
            />
            <Button
              onClick={handleDelete}
              color="red"
              variant="light"
              fullWidth
            >
              Delete Expense Category
            </Button>
          </Stack>
        )}
      </Modal>
    </Container>
  )
}
