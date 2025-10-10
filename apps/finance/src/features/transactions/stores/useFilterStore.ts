import { create } from 'zustand'

interface FilterStore {
  // Transaction filters
  transactionType: 'all' | 'income' | 'expense'
  searchQuery: string
  setTransactionType: (type: 'all' | 'income' | 'expense') => void
  setSearchQuery: (query: string) => void
  resetFilters: () => void
}

/**
 * Zustand store for filter and search state
 * Keeps filter state global and persistent across navigation
 */
export const useFilterStore = create<FilterStore>((set) => ({
  transactionType: 'all',
  searchQuery: '',
  setTransactionType: (type) => set({ transactionType: type }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  resetFilters: () => set({ transactionType: 'all', searchQuery: '' }),
}))

