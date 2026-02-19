import { describe, it, expect } from 'vitest'
import { getAiUsageSummaryTool, getSystemHealthTool } from './supabase-tools'

describe('getAiUsageSummaryTool', () => {
  it('has a description', () => {
    expect(typeof getAiUsageSummaryTool.description).toBe('string')
    expect(getAiUsageSummaryTool.description.length).toBeGreaterThan(10)
  })

  it('has an execute function', () => {
    expect(typeof getAiUsageSummaryTool.execute).toBe('function')
  })

  it('has an inputSchema', () => {
    expect(getAiUsageSummaryTool.inputSchema).toBeDefined()
  })

  it('inputSchema accepts empty input (all optional)', () => {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const result = getAiUsageSummaryTool.inputSchema!.safeParse({})
    expect(result.success).toBe(true)
  })

  it('inputSchema accepts a year/month filter', () => {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const result = getAiUsageSummaryTool.inputSchema!.safeParse({
      year: 2026,
      month: 2,
    })
    expect(result.success).toBe(true)
  })
})

describe('getSystemHealthTool', () => {
  it('has a description', () => {
    expect(typeof getSystemHealthTool.description).toBe('string')
    expect(getSystemHealthTool.description.length).toBeGreaterThan(10)
  })

  it('has an execute function', () => {
    expect(typeof getSystemHealthTool.execute).toBe('function')
  })
})
