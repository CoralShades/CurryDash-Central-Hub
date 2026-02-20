import { describe, it, expect } from 'vitest'
import {
  syncJiraDataSchema,
  syncGitHubDataSchema,
  listGitHubReposSchema,
} from './sync-integration-schema'

describe('syncJiraDataSchema', () => {
  it('accepts a valid array of project keys', () => {
    const result = syncJiraDataSchema.safeParse({ projectKeys: ['PROJ', 'TEAM'] })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.projectKeys).toEqual(['PROJ', 'TEAM'])
    }
  })

  it('accepts a single project key', () => {
    const result = syncJiraDataSchema.safeParse({ projectKeys: ['ALPHA'] })
    expect(result.success).toBe(true)
  })

  it('rejects an empty array', () => {
    const result = syncJiraDataSchema.safeParse({ projectKeys: [] })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.errors[0]?.message).toMatch(/Select at least one project/)
    }
  })

  it('rejects an array containing an empty string', () => {
    const result = syncJiraDataSchema.safeParse({ projectKeys: [''] })
    expect(result.success).toBe(false)
  })

  it('rejects missing projectKeys', () => {
    const result = syncJiraDataSchema.safeParse({})
    expect(result.success).toBe(false)
  })

  it('rejects non-array projectKeys', () => {
    const result = syncJiraDataSchema.safeParse({ projectKeys: 'PROJ' })
    expect(result.success).toBe(false)
  })
})

describe('syncGitHubDataSchema', () => {
  it('accepts a valid array of repo full names', () => {
    const result = syncGitHubDataSchema.safeParse({
      repoFullNames: ['owner/repo-a', 'owner/repo-b'],
    })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.repoFullNames).toEqual(['owner/repo-a', 'owner/repo-b'])
    }
  })

  it('accepts a single repo full name', () => {
    const result = syncGitHubDataSchema.safeParse({ repoFullNames: ['org/project'] })
    expect(result.success).toBe(true)
  })

  it('rejects an empty array', () => {
    const result = syncGitHubDataSchema.safeParse({ repoFullNames: [] })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.errors[0]?.message).toMatch(/Select at least one repo/)
    }
  })

  it('rejects missing repoFullNames', () => {
    const result = syncGitHubDataSchema.safeParse({})
    expect(result.success).toBe(false)
  })

  it('rejects non-array repoFullNames', () => {
    const result = syncGitHubDataSchema.safeParse({ repoFullNames: 'owner/repo' })
    expect(result.success).toBe(false)
  })
})

describe('listGitHubReposSchema', () => {
  it('accepts a valid org name', () => {
    const result = listGitHubReposSchema.safeParse({ org: 'my-org' })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.org).toBe('my-org')
    }
  })

  it('accepts an empty object (org is optional)', () => {
    const result = listGitHubReposSchema.safeParse({})
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.org).toBeUndefined()
    }
  })

  it('accepts undefined org', () => {
    const result = listGitHubReposSchema.safeParse({ org: undefined })
    expect(result.success).toBe(true)
  })

  it('rejects an empty string org (min length 1)', () => {
    const result = listGitHubReposSchema.safeParse({ org: '' })
    expect(result.success).toBe(false)
  })
})
