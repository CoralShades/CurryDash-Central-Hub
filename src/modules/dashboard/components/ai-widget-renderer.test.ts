import { describe, it, expect } from 'vitest'
import { getSkeletonVariant, getSampleData, AI_WIDGET_TYPES } from './ai-widget-renderer'

describe('AI_WIDGET_TYPES', () => {
  it('exports all 5 widget type constants', () => {
    expect(AI_WIDGET_TYPES).toContain('metric-card')
    expect(AI_WIDGET_TYPES).toContain('bar-chart')
    expect(AI_WIDGET_TYPES).toContain('line-chart')
    expect(AI_WIDGET_TYPES).toContain('pie-chart')
    expect(AI_WIDGET_TYPES).toContain('data-table')
  })
})

describe('getSkeletonVariant', () => {
  it('returns "stats" for metric-card', () => {
    expect(getSkeletonVariant('metric-card')).toBe('stats')
  })

  it('returns "chart" for bar-chart', () => {
    expect(getSkeletonVariant('bar-chart')).toBe('chart')
  })

  it('returns "chart" for line-chart', () => {
    expect(getSkeletonVariant('line-chart')).toBe('chart')
  })

  it('returns "chart" for pie-chart', () => {
    expect(getSkeletonVariant('pie-chart')).toBe('chart')
  })

  it('returns "table" for data-table', () => {
    expect(getSkeletonVariant('data-table')).toBe('table')
  })
})

describe('getSampleData', () => {
  it('returns non-empty array for bar-chart', () => {
    const data = getSampleData('bar-chart')
    expect(Array.isArray(data)).toBe(true)
    expect(data.length).toBeGreaterThan(0)
  })

  it('returns non-empty array for line-chart', () => {
    const data = getSampleData('line-chart')
    expect(data.length).toBeGreaterThan(0)
  })

  it('returns non-empty array for pie-chart', () => {
    const data = getSampleData('pie-chart')
    expect(data.length).toBeGreaterThan(0)
  })

  it('returns empty array for metric-card', () => {
    const data = getSampleData('metric-card')
    expect(data).toEqual([])
  })

  it('returns empty array for data-table', () => {
    const data = getSampleData('data-table')
    expect(data).toEqual([])
  })

  it('each bar/line chart data point has name and value properties', () => {
    const barData = getSampleData('bar-chart')
    for (const point of barData) {
      expect(point).toHaveProperty('name')
      expect(point).toHaveProperty('value')
    }
  })

  it('each pie chart data point has name and value properties', () => {
    const pieData = getSampleData('pie-chart')
    for (const point of pieData) {
      expect(point).toHaveProperty('name')
      expect(point).toHaveProperty('value')
    }
  })
})

describe('AiWidgetRenderer exports', () => {
  it('exports AiWidgetRenderer as a function', async () => {
    const mod = await import('./ai-widget-renderer')
    expect(typeof mod.AiWidgetRenderer).toBe('function')
  })
})
