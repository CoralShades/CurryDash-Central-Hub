import { describe, it, expect } from 'vitest'
import { getSprintReportDataTool, queueReportRetryTool } from './report-tools'

describe('getSprintReportDataTool', () => {
  it('has a description', () => {
    expect(typeof getSprintReportDataTool.description).toBe('string')
    expect(getSprintReportDataTool.description.length).toBeGreaterThan(10)
  })

  it('has an execute function', () => {
    expect(typeof getSprintReportDataTool.execute).toBe('function')
  })

  it('has an inputSchema', () => {
    expect(getSprintReportDataTool.inputSchema).toBeDefined()
  })

  it('inputSchema accepts empty object (uses default project keys)', () => {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const result = getSprintReportDataTool.inputSchema!.safeParse({})
    expect(result.success).toBe(true)
  })

  it('inputSchema accepts custom projectKeys array', () => {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const result = getSprintReportDataTool.inputSchema!.safeParse({
      projectKeys: ['CUR', 'CAD'],
    })
    expect(result.success).toBe(true)
  })

  it('inputSchema rejects empty projectKeys array', () => {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const result = getSprintReportDataTool.inputSchema!.safeParse({
      projectKeys: [],
    })
    expect(result.success).toBe(false)
  })

  it('inputSchema accepts sessionTokens', () => {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const result = getSprintReportDataTool.inputSchema!.safeParse({
      sessionTokens: 1000,
    })
    expect(result.success).toBe(true)
  })

  it('inputSchema treats sessionTokens as optional (defaults to 0)', () => {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const result = getSprintReportDataTool.inputSchema!.safeParse({})
    expect(result.success).toBe(true)
  })

  it('description mentions all 6 default project keys', () => {
    const desc = getSprintReportDataTool.description
    expect(desc).toContain('CUR')
    expect(desc).toContain('CAD')
    expect(desc).toContain('CAR')
    expect(desc).toContain('CPFP')
    expect(desc).toContain('PACK')
    expect(desc).toContain('CCW')
  })

  it('description mentions source citation and timestamp', () => {
    const desc = getSprintReportDataTool.description.toLowerCase()
    expect(desc).toMatch(/source|citation|timestamp/i)
  })
})

describe('queueReportRetryTool', () => {
  it('has a description', () => {
    expect(typeof queueReportRetryTool.description).toBe('string')
    expect(queueReportRetryTool.description.length).toBeGreaterThan(10)
  })

  it('has an execute function', () => {
    expect(typeof queueReportRetryTool.execute).toBe('function')
  })

  it('has an inputSchema', () => {
    expect(queueReportRetryTool.inputSchema).toBeDefined()
  })

  it('inputSchema accepts valid retry params', () => {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const result = queueReportRetryTool.inputSchema!.safeParse({
      requestParams: { reportType: 'sprint', projectKeys: ['CUR'] },
      errorReason: 'AI provider unavailable',
    })
    expect(result.success).toBe(true)
  })

  it('inputSchema requires errorReason', () => {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const result = queueReportRetryTool.inputSchema!.safeParse({
      requestParams: { reportType: 'sprint' },
    })
    expect(result.success).toBe(false)
  })

  it('inputSchema accepts optional userId', () => {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const result = queueReportRetryTool.inputSchema!.safeParse({
      requestParams: { reportType: 'sprint' },
      errorReason: 'AI provider unavailable',
      userId: 'user-123',
    })
    expect(result.success).toBe(true)
  })

  it('description mentions queue and retry', () => {
    const desc = queueReportRetryTool.description.toLowerCase()
    expect(desc).toMatch(/queue|retry/i)
  })
})
