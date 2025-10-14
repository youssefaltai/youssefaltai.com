'use client'

import { useState } from 'react'
import { Plus, Landmark } from 'lucide-react'
import { Container, Stack, ActionIcon, Modal, Title, Text, Group, Paper, Skeleton, Button } from '@mantine/core'
import { useLoans, useCreateLoan, useUpdateLoan, useDeleteLoan } from '../../../hooks/use-loans'
import { LoanCard } from '../../../components/loans/LoanCard'
import { LoanForm } from '../../../components/forms/LoanForm'
import type { Account } from '@repo/db'
import type { CreateLoanSchema, UpdateLoanSchema } from '../../../features/accounts/loan/validation'

export default function LoansPage() {
  const { data: loans = [], isLoading } = useLoans()
  const createLoan = useCreateLoan()
  const updateLoan = useUpdateLoan()
  const deleteLoan = useDeleteLoan()

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [editingLoan, setEditingLoan] = useState<Account | null>(null)

  const handleCreate = async (data: CreateLoanSchema) => {
    await createLoan.mutateAsync(data)
    setIsCreateModalOpen(false)
  }

  const handleUpdate = async (data: UpdateLoanSchema) => {
    if (!editingLoan) return
    await updateLoan.mutateAsync({ id: editingLoan.id, data })
    setEditingLoan(null)
  }

  const handleDelete = async () => {
    if (!editingLoan) return
    if (!confirm('Are you sure you want to delete this loan?')) return
    await deleteLoan.mutateAsync(editingLoan.id)
    setEditingLoan(null)
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
            <Title order={1} size="h2">Loans</Title>
            <Text c="dimmed" size="sm">Track debts and payments</Text>
          </div>
        </Group>

        {loans.length === 0 ? (
          <Stack align="center" gap="md" py="xl" style={{ textAlign: 'center' }}>
            <Landmark size={64} style={{ opacity: 0.3 }} />
            <Title order={3} size="h4">No Loans Tracked</Title>
            <Text c="dimmed">Add your first loan</Text>
          </Stack>
        ) : (
          <Paper withBorder radius="md">
            <Stack gap={0}>
              {loans.map((loan, index) => (
                <LoanCard
                  key={loan.id}
                  loan={loan}
                  onClick={() => setEditingLoan(loan)}
                  isFirst={index === 0}
                  isLast={index === loans.length - 1}
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
        aria-label="Add Loan"
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
        title="Add Loan"
        centered
        size="md"
      >
        <LoanForm
          onSubmit={handleCreate}
          onCancel={() => setIsCreateModalOpen(false)}
        />
      </Modal>

      <Modal
        opened={!!editingLoan}
        onClose={() => setEditingLoan(null)}
        title="Edit Loan"
        centered
        size="md"
      >
        {editingLoan && (
          <Stack gap="md">
            <LoanForm
              initialData={{
                name: editingLoan.name,
                currency: editingLoan.currency,
                dueDate: typeof editingLoan.dueDate === 'string' 
                  ? editingLoan.dueDate 
                  : editingLoan.dueDate 
                    ? new Date(editingLoan.dueDate).toISOString()
                    : new Date().toISOString(),
                description: editingLoan.description || undefined,
                openingBalance: Number(editingLoan.balance),
              }}
              onSubmit={handleUpdate}
              onCancel={() => setEditingLoan(null)}
            />
            <Button
              onClick={handleDelete}
              color="red"
              variant="light"
              fullWidth
            >
              Delete Loan
            </Button>
          </Stack>
        )}
      </Modal>
    </Container>
  )
}
