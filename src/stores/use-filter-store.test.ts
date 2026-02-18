import { describe, it, expect, beforeEach } from 'vitest'
import { useFilterStore } from '@/stores/use-filter-store'

describe('useFilterStore', () => {
  beforeEach(() => {
    useFilterStore.getState().resetFilters()
  })

  it('starts with empty project keys', () => {
    expect(useFilterStore.getState().selectedProjectKeys).toEqual([])
  })

  it('toggleProjectKey adds and removes keys', () => {
    const { toggleProjectKey } = useFilterStore.getState()
    toggleProjectKey('CUR')
    expect(useFilterStore.getState().selectedProjectKeys).toContain('CUR')
    toggleProjectKey('CUR')
    expect(useFilterStore.getState().selectedProjectKeys).not.toContain('CUR')
  })

  it('resetFilters clears all filters', () => {
    useFilterStore.getState().setSearchQuery('test')
    useFilterStore.getState().setStatus('blocked')
    useFilterStore.getState().resetFilters()
    expect(useFilterStore.getState().searchQuery).toBe('')
    expect(useFilterStore.getState().status).toBe('all')
  })

  it('setProjectKeys replaces all keys', () => {
    useFilterStore.getState().setProjectKeys(['CUR', 'DEV'])
    expect(useFilterStore.getState().selectedProjectKeys).toEqual(['CUR', 'DEV'])
  })

  it('setDateRange updates date range', () => {
    useFilterStore.getState().setDateRange('7d')
    expect(useFilterStore.getState().dateRange).toBe('7d')
  })

  it('setAssignee updates assignee email', () => {
    useFilterStore.getState().setAssignee('dev@example.com')
    expect(useFilterStore.getState().assigneeEmail).toBe('dev@example.com')
  })
})
