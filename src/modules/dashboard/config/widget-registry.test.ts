import { describe, it, expect } from 'vitest'
import { widgetRegistry, VALID_COL_SPANS } from './widget-registry'
import type { Role } from '@/types/roles'
import { ROLES } from '@/types/roles'

const ALL_ROLES: Role[] = ROLES

describe('widgetRegistry', () => {
  it('has entries for all four roles', () => {
    for (const role of ALL_ROLES) {
      expect(widgetRegistry[role]).toBeDefined()
      expect(widgetRegistry[role].length).toBeGreaterThan(0)
    }
  })

  it('each widget has a valid colSpan', () => {
    for (const role of ALL_ROLES) {
      for (const widget of widgetRegistry[role]) {
        expect(VALID_COL_SPANS).toContain(widget.colSpan)
      }
    }
  })

  it('widget IDs are unique within each role', () => {
    for (const role of ALL_ROLES) {
      const ids = widgetRegistry[role].map((w) => w.id)
      const uniqueIds = new Set(ids)
      expect(uniqueIds.size).toBe(ids.length)
    }
  })

  it('every widget has a non-empty title and id', () => {
    for (const role of ALL_ROLES) {
      for (const widget of widgetRegistry[role]) {
        expect(widget.id.trim().length).toBeGreaterThan(0)
        expect(widget.title.trim().length).toBeGreaterThan(0)
      }
    }
  })

  it('every widget has a valid skeletonVariant', () => {
    const validVariants = ['stats', 'chart', 'table', 'list']
    for (const role of ALL_ROLES) {
      for (const widget of widgetRegistry[role]) {
        expect(validVariants).toContain(widget.skeletonVariant)
      }
    }
  })

  it('all roles have the 4 standard metric widgets', () => {
    const standardIds = ['stories-completed', 'prs-merged', 'bugs-open', 'ci-status']
    for (const role of ALL_ROLES) {
      const ids = widgetRegistry[role].map((w) => w.id)
      for (const id of standardIds) {
        expect(ids).toContain(id)
      }
    }
  })

  it('metric widgets use 3-column span for 4-across layout', () => {
    const metricIds = ['stories-completed', 'prs-merged', 'bugs-open', 'ci-status']
    for (const role of ALL_ROLES) {
      for (const widget of widgetRegistry[role]) {
        if (metricIds.includes(widget.id)) {
          expect(widget.colSpan).toBe(3)
        }
      }
    }
  })
})
