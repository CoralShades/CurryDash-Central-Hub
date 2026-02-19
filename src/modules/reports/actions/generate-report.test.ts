import { describe, it, expect, vi } from 'vitest'

// Mock auth and mastra to avoid ESM/next-auth issues in tests
vi.mock('@/lib/auth', () => ({
  auth: vi.fn().mockResolvedValue(null),
}))
vi.mock('@/mastra', () => ({
  createReportAgent: vi.fn(() => ({
    generate: vi.fn().mockResolvedValue({ text: 'mock report' }),
    stream: vi.fn(),
    tools: {},
    name: 'report-agent',
  })),
}))

describe('generate-report actions', () => {
  it('exports generateProgressSummary as a function', async () => {
    const mod = await import('./generate-report')
    expect(typeof mod.generateProgressSummary).toBe('function')
  })

  it('generateProgressSummary returns auth error when not authenticated', async () => {
    const mod = await import('./generate-report')
    const result = await mod.generateProgressSummary()
    expect(result).toHaveProperty('data')
    expect(result).toHaveProperty('error')
    // No session → auth error
    expect(result.data).toBeNull()
    expect(result.error).not.toBeNull()
    if (result.error) {
      expect(result.error.code).toBe('AUTH_REQUIRED')
    }
  })
})
