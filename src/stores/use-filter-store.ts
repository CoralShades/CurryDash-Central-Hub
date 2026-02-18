import { create } from 'zustand'
import { useShallow } from 'zustand/react/shallow'

type FilterStatus = 'all' | 'open' | 'in-progress' | 'done' | 'blocked'
type DateRange = '7d' | '14d' | '30d' | '90d' | 'custom'

interface FilterState {
  selectedProjectKeys: string[]
  dateRange: DateRange
  status: FilterStatus
  assigneeEmail: string | null
  searchQuery: string
  // Actions
  setProjectKeys: (keys: string[]) => void
  toggleProjectKey: (key: string) => void
  setDateRange: (range: DateRange) => void
  setStatus: (status: FilterStatus) => void
  setAssignee: (email: string | null) => void
  setSearchQuery: (query: string) => void
  updateFilter: (partial: Partial<Omit<FilterState, 'setProjectKeys' | 'toggleProjectKey' | 'setDateRange' | 'setStatus' | 'setAssignee' | 'setSearchQuery' | 'updateFilter' | 'resetFilters'>>) => void
  resetFilters: () => void
}

const initialFilters = {
  selectedProjectKeys: [] as string[],
  dateRange: '30d' as DateRange,
  status: 'all' as FilterStatus,
  assigneeEmail: null as string | null,
  searchQuery: '',
}

export const useFilterStore = create<FilterState>((set) => ({
  ...initialFilters,

  setProjectKeys: (keys) => set({ selectedProjectKeys: keys }),
  toggleProjectKey: (key) =>
    set((state) => ({
      selectedProjectKeys: state.selectedProjectKeys.includes(key)
        ? state.selectedProjectKeys.filter((k) => k !== key)
        : [...state.selectedProjectKeys, key],
    })),
  setDateRange: (range) => set({ dateRange: range }),
  setStatus: (status) => set({ status }),
  setAssignee: (email) => set({ assigneeEmail: email }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  updateFilter: (partial) => set(partial),
  resetFilters: () => set(initialFilters),
}))

export const useActiveFilters = () =>
  useFilterStore(useShallow((s) => ({
    selectedProjectKeys: s.selectedProjectKeys,
    dateRange: s.dateRange,
    status: s.status,
    assigneeEmail: s.assigneeEmail,
    searchQuery: s.searchQuery,
  })))
