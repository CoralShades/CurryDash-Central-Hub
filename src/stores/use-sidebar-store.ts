import { create } from 'zustand'
import { useShallow } from 'zustand/react/shallow'

interface SidebarState {
  isExpanded: boolean
  // Actions
  expand: () => void
  collapse: () => void
  toggleSidebar: () => void
  setExpanded: (expanded: boolean) => void
}

export const useSidebarStore = create<SidebarState>((set) => ({
  isExpanded: true,

  expand: () => set({ isExpanded: true }),
  collapse: () => set({ isExpanded: false }),
  toggleSidebar: () => set((state) => ({ isExpanded: !state.isExpanded })),
  setExpanded: (expanded) => set({ isExpanded: expanded }),
}))

export const useSidebarState = () =>
  useSidebarStore(useShallow((s) => ({ isExpanded: s.isExpanded, toggle: s.toggleSidebar })))
