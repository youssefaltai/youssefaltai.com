'use client'

import { useState } from 'react'
import { Plus, CreditCard } from 'lucide-react'
import { Container, Stack, ActionIcon, Modal, Title, Text, Group, Paper, Skeleton, Button } from '@mantine/core'
import { useCreditCards, useCreateCreditCard, useUpdateCreditCard, useDeleteCreditCard } from '../../../hooks/use-credit-cards'
import { CreditCardCard } from '../../../components/credit-cards/CreditCardCard'
import { CreditCardForm } from '../../../components/forms/CreditCardForm'
import type { Account } from '@repo/db'
import type { CreateCreditCardSchema, UpdateCreditCardSchema } from '../../../features/accounts/credit-card/validation'

export default function CreditCardsPage() {
  const { data: creditCards = [], isLoading } = useCreditCards()
  const createCreditCard = useCreateCreditCard()
  const updateCreditCard = useUpdateCreditCard()
  const deleteCreditCard = useDeleteCreditCard()

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [editingCard, setEditingCard] = useState<Account | null>(null)

  const handleCreate = async (data: CreateCreditCardSchema) => {
    await createCreditCard.mutateAsync(data)
    setIsCreateModalOpen(false)
  }

  const handleUpdate = async (data: UpdateCreditCardSchema) => {
    if (!editingCard) return
    await updateCreditCard.mutateAsync({ id: editingCard.id, data })
    setEditingCard(null)
  }

  const handleDelete = async () => {
    if (!editingCard) return
    if (!confirm('Are you sure you want to delete this credit card?')) return
    await deleteCreditCard.mutateAsync(editingCard.id)
    setEditingCard(null)
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
            <Title order={1} size="h2">Credit Cards</Title>
            <Text c="dimmed" size="sm">Manage your credit cards</Text>
          </div>
        </Group>

        {creditCards.length === 0 ? (
          <Stack align="center" gap="md" py="xl" style={{ textAlign: 'center' }}>
            <CreditCard size={64} style={{ opacity: 0.3 }} />
            <Title order={3} size="h4">No Credit Cards Added</Title>
            <Text c="dimmed">Add your first credit card</Text>
          </Stack>
        ) : (
          <Paper withBorder radius="md">
            <Stack gap={0}>
              {creditCards.map((card, index) => (
                <CreditCardCard
                  key={card.id}
                  creditCard={card}
                  onClick={() => setEditingCard(card)}
                  isFirst={index === 0}
                  isLast={index === creditCards.length - 1}
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
        aria-label="Add Credit Card"
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
        title="Add Credit Card"
        centered
        size="md"
      >
        <CreditCardForm
          onSubmit={handleCreate}
          onCancel={() => setIsCreateModalOpen(false)}
        />
      </Modal>

      <Modal
        opened={!!editingCard}
        onClose={() => setEditingCard(null)}
        title="Edit Credit Card"
        centered
        size="md"
      >
        {editingCard && (
          <Stack gap="md">
            <CreditCardForm
              initialData={{
                ...editingCard,
                description: editingCard.description || undefined,
                openingBalance: Number(editingCard.balance),
              }}
              onSubmit={handleUpdate}
              onCancel={() => setEditingCard(null)}
            />
            <Button
              onClick={handleDelete}
              color="red"
              variant="light"
              fullWidth
            >
              Delete Credit Card
            </Button>
          </Stack>
        )}
      </Modal>
    </Container>
  )
}
