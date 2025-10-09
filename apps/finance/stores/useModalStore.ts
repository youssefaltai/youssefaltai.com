import { create } from 'zustand'

interface ModalStore {
  showAddTransaction: boolean
  showCategories: boolean
  openAddTransaction: () => void
  closeAddTransaction: () => void
  openCategories: () => void
  closeCategories: () => void
}

/**
 * Zustand store for modal states
 * Lightweight alternative to useState for global UI state
 */
export const useModalStore = create<ModalStore>((set) => ({
  showAddTransaction: false,
  showCategories: false,
  openAddTransaction: () => set({ showAddTransaction: true }),
  closeAddTransaction: () => set({ showAddTransaction: false }),
  openCategories: () => set({ showCategories: true }),
  closeCategories: () => set({ showCategories: false }),
}))

