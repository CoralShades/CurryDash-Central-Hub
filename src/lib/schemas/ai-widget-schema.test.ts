import { describe, it, expect } from 'vitest'
import { aiWidgetConfigSchema, AI_WIDGET_TYPES } from './ai-widget-schema'

const validConfig = {
  type: 'bar-chart',
  title: 'Bugs by Priority',
  dataSource: 'jira',
  query: 'project = CUR AND type = Bug ORDER BY priority DESC',
  colSpan: 6,
  refreshBehavior: 'realtime',
}

describe('aiWidgetConfigSchema', () => {
  it('accepts a valid bar-chart config', () => {
    const result = aiWidgetConfigSchema.safeParse(validConfig)
    expect(result.success).toBe(true)
  })

  it('accepts all valid widget types', () => {
    for (const type of AI_WIDGET_TYPES) {
      const result = aiWidgetConfigSchema.safeParse({ ...validConfig, type })
      expect(result.success).toBe(true)
    }
  })

  it('rejects unknown widget types', () => {
    const result = aiWidgetConfigSchema.safeParse({ ...validConfig, type: 'scatter-chart' })
    expect(result.success).toBe(false)
  })

  it('rejects missing required title', () => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { title, ...rest } = validConfig
    const result = aiWidgetConfigSchema.safeParse(rest)
    expect(result.success).toBe(false)
  })

  it('rejects empty title', () => {
    const result = aiWidgetConfigSchema.safeParse({ ...validConfig, title: '' })
    expect(result.success).toBe(false)
  })

  it('rejects title over 80 characters', () => {
    const result = aiWidgetConfigSchema.safeParse({ ...validConfig, title: 'A'.repeat(81) })
    expect(result.success).toBe(false)
  })

  it('accepts title at exactly 80 characters', () => {
    const result = aiWidgetConfigSchema.safeParse({ ...validConfig, title: 'A'.repeat(80) })
    expect(result.success).toBe(true)
  })

  it('rejects invalid dataSource', () => {
    const result = aiWidgetConfigSchema.safeParse({ ...validConfig, dataSource: 'gitlab' })
    expect(result.success).toBe(false)
  })

  it('rejects invalid colSpan values', () => {
    for (const invalid of [1, 2, 5, 7, 8, 10]) {
      const result = aiWidgetConfigSchema.safeParse({ ...validConfig, colSpan: invalid })
      expect(result.success).toBe(false)
    }
  })

  it('accepts valid colSpan values (3, 4, 6, 12)', () => {
    for (const colSpan of [3, 4, 6, 12]) {
      const result = aiWidgetConfigSchema.safeParse({ ...validConfig, colSpan })
      expect(result.success).toBe(true)
    }
  })

  it('rejects invalid refreshBehavior', () => {
    const result = aiWidgetConfigSchema.safeParse({ ...validConfig, refreshBehavior: 'live' })
    expect(result.success).toBe(false)
  })

  it('rejects empty query', () => {
    const result = aiWidgetConfigSchema.safeParse({ ...validConfig, query: '' })
    expect(result.success).toBe(false)
  })

  it('accepts optional description', () => {
    const result = aiWidgetConfigSchema.safeParse({ ...validConfig, description: 'Shows bugs by priority' })
    expect(result.success).toBe(true)
  })

  it('rejects description over 200 characters', () => {
    const result = aiWidgetConfigSchema.safeParse({ ...validConfig, description: 'D'.repeat(201) })
    expect(result.success).toBe(false)
  })

  it('accepts valid CSS custom property colors', () => {
    const result = aiWidgetConfigSchema.safeParse({
      ...validConfig,
      displayProperties: {
        primaryColor: 'var(--color-turmeric)',
        secondaryColor: 'var(--color-coriander)',
      },
    })
    expect(result.success).toBe(true)
  })

  it('rejects hardcoded hex colors', () => {
    const result = aiWidgetConfigSchema.safeParse({
      ...validConfig,
      displayProperties: { primaryColor: '#E6B04B' },
    })
    expect(result.success).toBe(false)
  })

  it('rejects rgb() color strings', () => {
    const result = aiWidgetConfigSchema.safeParse({
      ...validConfig,
      displayProperties: { primaryColor: 'rgb(230, 176, 75)' },
    })
    expect(result.success).toBe(false)
  })
})

describe('AI_WIDGET_TYPES', () => {
  it('includes all 5 widget types', () => {
    expect(AI_WIDGET_TYPES).toContain('metric-card')
    expect(AI_WIDGET_TYPES).toContain('bar-chart')
    expect(AI_WIDGET_TYPES).toContain('line-chart')
    expect(AI_WIDGET_TYPES).toContain('pie-chart')
    expect(AI_WIDGET_TYPES).toContain('data-table')
    expect(AI_WIDGET_TYPES).toHaveLength(5)
  })
})
