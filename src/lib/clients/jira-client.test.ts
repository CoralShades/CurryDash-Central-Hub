import { describe, it, expect, vi, beforeEach } from 'vitest'
import { RateLimitError, IntegrationError } from '@/lib/errors'

// Clear Jira credentials before each test so createClient() throws synchronously.
// We use vi.resetModules() + delete process.env to ensure a fresh module graph
// without cached environment values. Because vi.resetModules() causes new module
// instances to be loaded on dynamic import, we assert by error code rather than
// instanceof (which would compare two separate class objects across module reloads).
beforeEach(() => {
  vi.resetModules()
  delete process.env.JIRA_BASE_URL
  delete process.env.JIRA_EMAIL
  delete process.env.JIRA_API_TOKEN
})

describe('getJiraProjects', () => {
  it('throws IntegrationError when credentials are missing', async () => {
    const { getJiraProjects } = await import('@/lib/clients/jira-client')
    // Use error code rather than instanceof to avoid cross-module-registry mismatch
    await expect(getJiraProjects()).rejects.toMatchObject({
      code: 'INTEGRATION_ERROR',
      name: 'IntegrationError',
    })
  })
})

describe('Jira rate limit retry', () => {
  it('RateLimitError has RATE_LIMIT_ERROR code', () => {
    const err = new RateLimitError('rate limited')
    expect(err.code).toBe('RATE_LIMIT_ERROR')
  })
})

describe('IntegrationError', () => {
  it('has INTEGRATION_ERROR code', () => {
    const err = new IntegrationError('missing creds')
    expect(err.code).toBe('INTEGRATION_ERROR')
    expect(err.name).toBe('IntegrationError')
  })
})
