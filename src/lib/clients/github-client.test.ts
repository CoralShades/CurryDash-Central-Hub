import { describe, it, expect, vi, beforeEach } from 'vitest'
import { IntegrationError, RateLimitError } from '@/lib/errors'

beforeEach(() => {
  vi.stubEnv('GITHUB_TOKEN', '')
})

describe('GitHub client', () => {
  it('throws IntegrationError when GITHUB_TOKEN is missing', async () => {
    const { getRepositories } = await import('@/lib/clients/github-client')
    await expect(getRepositories()).rejects.toBeInstanceOf(IntegrationError)
  })

  it('getRateLimitRemaining returns null initially', async () => {
    const { getRateLimitRemaining } = await import('@/lib/clients/github-client')
    expect(getRateLimitRemaining()).toBeNull()
  })

  it('RateLimitError has correct code', () => {
    const err = new RateLimitError('rate limited')
    expect(err.code).toBe('RATE_LIMIT_ERROR')
  })
})
