import { create } from 'zustand'
import { useShallow } from 'zustand/react/shallow'
import type { Role } from '@/types/roles'

type DashboardView = 'overview' | 'sprint' | 'github' | 'ai' | 'notifications'

interface DashboardState {
  activeRole: Role | null
  currentView: DashboardView
  isAiSidebarOpen: boolean
  selectedWidgetId: string | null
  // Actions
  setActiveRole: (role: Role | null) => void
  setCurrentView: (view: DashboardView) => void
  openAiSidebar: () => void
  closeAiSidebar: () => void
  toggleAiSidebar: () => void
  selectWidget: (id: string | null) => void
  resetDashboard: () => void
}

const initialState = {
  activeRole: null as Role | null,
  currentView: 'overview' as DashboardView,
  isAiSidebarOpen: false,
  selectedWidgetId: null as string | null,
}

export const useDashboardStore = create<DashboardState>((set) => ({
  ...initialState,

  setActiveRole: (role) => set({ activeRole: role }),
  setCurrentView: (view) => set({ currentView: view }),
  openAiSidebar: () => set({ isAiSidebarOpen: true }),
  closeAiSidebar: () => set({ isAiSidebarOpen: false }),
  toggleAiSidebar: () => set((state) => ({ isAiSidebarOpen: !state.isAiSidebarOpen })),
  selectWidget: (id) => set({ selectedWidgetId: id }),
  resetDashboard: () => set(initialState),
}))

// Selector hooks using useShallow to prevent unnecessary re-renders
export const useDashboardView = () =>
  useDashboardStore(useShallow((s) => ({ activeRole: s.activeRole, currentView: s.currentView })))

export const useAiSidebar = () =>
  useDashboardStore(useShallow((s) => ({ isOpen: s.isAiSidebarOpen, toggle: s.toggleAiSidebar })))
