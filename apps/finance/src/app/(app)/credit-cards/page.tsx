'use client'

import { useState } from 'react'
import { FloatingActionButton, Modal, Plus, CreditCard, PageLayout, EntityList, LoadingSkeleton } from '@repo/ui'
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
    return <LoadingSkeleton title="Credit Cards" subtitle="Manage your credit cards" />
  }

  return (
    <PageLayout title="Credit Cards" subtitle="Manage your credit cards">
      <EntityList
        items={creditCards}
        emptyIcon={CreditCard}
        emptyTitle="No Credit Cards Added"
        emptyDescription="Add your first credit card"
        renderItem={(card, index) => (
          <CreditCardCard
            key={card.id}
            creditCard={card}
            onClick={() => setEditingCard(card)}
            isFirst={index === 0}
            isLast={index === creditCards.length - 1}
          />
        )}
      />

      <FloatingActionButton 
        icon={Plus} 
        label="Add Credit Card"
        onClick={() => setIsCreateModalOpen(true)}
        className="fixed bottom-20 right-4"
      />

      {/* Create Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Add Credit Card"
      >
        <CreditCardForm
          onSubmit={handleCreate}
          onCancel={() => setIsCreateModalOpen(false)}
        />
      </Modal>

      {/* Edit Modal */}
      <Modal
        isOpen={!!editingCard}
        onClose={() => setEditingCard(null)}
        title="Edit Credit Card"
      >
        {editingCard && (
          <div className="space-y-4">
            <CreditCardForm
              initialData={{
                ...editingCard,
                description: editingCard.description || undefined,
                openingBalance: Number(editingCard.balance),
              }}
              onSubmit={handleUpdate}
              onCancel={() => setEditingCard(null)}
            />
            <button
              onClick={handleDelete}
              className="w-full py-3 text-ios-red font-semibold hover:bg-ios-red/10 rounded-ios transition-colors"
            >
              Delete Credit Card
            </button>
          </div>
        )}
      </Modal>
    </PageLayout>
  )
}
