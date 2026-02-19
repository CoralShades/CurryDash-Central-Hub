import { describe, it, expect, beforeEach } from 'vitest'
import { useDashboardStore } from '@/stores/use-dashboard-store'

describe('useDashboardStore', () => {
  beforeEach(() => {
    useDashboardStore.getState().resetDashboard()
  })

  it('starts with null activeRole', () => {
    expect(useDashboardStore.getState().activeRole).toBeNull()
  })

  it('setActiveRole updates role', () => {
    useDashboardStore.getState().setActiveRole('admin')
    expect(useDashboardStore.getState().activeRole).toBe('admin')
  })

  it('toggleAiSidebar toggles state', () => {
    const { toggleAiSidebar } = useDashboardStore.getState()
    expect(useDashboardStore.getState().isAiSidebarOpen).toBe(false)
    toggleAiSidebar()
    expect(useDashboardStore.getState().isAiSidebarOpen).toBe(true)
    toggleAiSidebar()
    expect(useDashboardStore.getState().isAiSidebarOpen).toBe(false)
  })

  it('setCurrentView updates view', () => {
    useDashboardStore.getState().setCurrentView('sprint')
    expect(useDashboardStore.getState().currentView).toBe('sprint')
  })

  it('selectWidget and openAiSidebar work together', () => {
    useDashboardStore.getState().selectWidget('widget-1')
    useDashboardStore.getState().openAiSidebar()
    expect(useDashboardStore.getState().selectedWidgetId).toBe('widget-1')
    expect(useDashboardStore.getState().isAiSidebarOpen).toBe(true)
  })

  it('isAiAvailable starts as true', () => {
    expect(useDashboardStore.getState().isAiAvailable).toBe(true)
  })

  it('setAiAvailable updates availability state', () => {
    useDashboardStore.getState().setAiAvailable(false)
    expect(useDashboardStore.getState().isAiAvailable).toBe(false)
    useDashboardStore.getState().setAiAvailable(true)
    expect(useDashboardStore.getState().isAiAvailable).toBe(true)
  })

  it('resetDashboard resets isAiAvailable to true', () => {
    useDashboardStore.getState().setAiAvailable(false)
    useDashboardStore.getState().resetDashboard()
    expect(useDashboardStore.getState().isAiAvailable).toBe(true)
  })
})
