import { create } from 'zustand'

interface FilterStore {
  // Transaction filters
  transactionType: 'all' | 'income' | 'expense'
  searchQuery: string
  selectedCategories: string[]
  dateFrom: string | null
  dateTo: string | null
  setTransactionType: (type: 'all' | 'income' | 'expense') => void
  setSearchQuery: (query: string) => void
  toggleCategory: (category: string) => void
  clearCategories: () => void
  setDateFrom: (date: string | null) => void
  setDateTo: (date: string | null) => void
  resetFilters: () => void
}

/**
 * Zustand store for filter and search state
 * Keeps filter state global and persistent across navigation
 */
export const useFilterStore = create<FilterStore>((set) => ({
  transactionType: 'all',
  searchQuery: '',
  selectedCategories: [],
  dateFrom: null,
  dateTo: null,
  setTransactionType: (type) => set({ transactionType: type }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  toggleCategory: (category) => set((state) => ({
    selectedCategories: state.selectedCategories.includes(category)
      ? state.selectedCategories.filter((c) => c !== category)
      : [...state.selectedCategories, category]
  })),
  clearCategories: () => set({ selectedCategories: [] }),
  setDateFrom: (date) => set({ dateFrom: date }),
  setDateTo: (date) => set({ dateTo: date }),
  resetFilters: () => set({ 
    transactionType: 'all', 
    searchQuery: '', 
    selectedCategories: [],
    dateFrom: null,
    dateTo: null 
  }),
}))

