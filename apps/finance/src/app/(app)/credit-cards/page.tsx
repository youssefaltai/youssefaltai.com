'use client'

import { useState } from 'react'
import { PageHeader, FloatingActionButton, EmptyState, Modal, Plus, CreditCard } from '@repo/ui'
import { useCreditCards, useCreateCreditCard, useUpdateCreditCard, useDeleteCreditCard } from '../../../hooks/use-credit-cards'
import { CreditCardCard } from '../../../components/credit-cards/CreditCardCard'
import { CreditCardForm } from '../../../components/forms/CreditCardForm'
import type { Account } from '@repo/db'

export default function CreditCardsPage() {
  const { data: creditCards = [], isLoading } = useCreditCards()
  const createCreditCard = useCreateCreditCard()
  const updateCreditCard = useUpdateCreditCard()
  const deleteCreditCard = useDeleteCreditCard()

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [editingCard, setEditingCard] = useState<Account | null>(null)

  const handleCreate = async (data: any) => {
    await createCreditCard.mutateAsync(data)
    setIsCreateModalOpen(false)
  }

  const handleUpdate = async (data: any) => {
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
      <div className="p-4">
        <PageHeader title="Credit Cards" />
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
      <PageHeader title="Credit Cards" />

      {creditCards.length === 0 ? (
        <div className="mt-12">
          <EmptyState
            icon={CreditCard}
            title="No Credit Cards Added"
            description="Add your first credit card"
          />
        </div>
      ) : (
        <div className="mt-6 bg-white rounded-ios border border-ios-gray-5 shadow-ios-sm overflow-hidden">
          {creditCards.map((card, index) => (
            <CreditCardCard
              key={card.id}
              creditCard={card}
              onClick={() => setEditingCard(card)}
              isFirst={index === 0}
              isLast={index === creditCards.length - 1}
            />
          ))}
        </div>
      )}

      <FloatingActionButton 
        icon={Plus} 
        label="Add Credit Card"
        onClick={() => setIsCreateModalOpen(true)} 
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
              initialData={editingCard}
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
    </div>
  )
}

