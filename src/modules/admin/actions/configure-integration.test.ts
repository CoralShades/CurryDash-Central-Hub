import { describe, it, expect } from 'vitest'
import {
  testConnectionSchema,
  saveCredentialsSchema,
  saveJiraCredentialsSchema,
  saveGithubCredentialsSchema,
  saveAnthropicCredentialsSchema,
} from '../schemas/integration-schema'

describe('Integration Schema Validation', () => {
  describe('testConnectionSchema', () => {
    it('validates jira integration', () => {
      const result = testConnectionSchema.safeParse({ integration: 'jira' })
      expect(result.success).toBe(true)
    })

    it('validates github integration', () => {
      const result = testConnectionSchema.safeParse({ integration: 'github' })
      expect(result.success).toBe(true)
    })

    it('validates anthropic integration', () => {
      const result = testConnectionSchema.safeParse({ integration: 'anthropic' })
      expect(result.success).toBe(true)
    })

    it('rejects invalid integration type', () => {
      const result = testConnectionSchema.safeParse({ integration: 'slack' })
      expect(result.success).toBe(false)
    })

    it('requires integration field', () => {
      const result = testConnectionSchema.safeParse({})
      expect(result.success).toBe(false)
    })
  })

  describe('saveJiraCredentialsSchema', () => {
    const valid = {
      integration: 'jira',
      baseUrl: 'https://mycompany.atlassian.net',
      email: 'admin@company.com',
      apiToken: 'ATATxyz123',
    }

    it('validates valid Jira credentials', () => {
      const result = saveJiraCredentialsSchema.safeParse(valid)
      expect(result.success).toBe(true)
    })

    it('rejects invalid URL', () => {
      const result = saveJiraCredentialsSchema.safeParse({ ...valid, baseUrl: 'not-a-url' })
      expect(result.success).toBe(false)
    })

    it('rejects invalid email', () => {
      const result = saveJiraCredentialsSchema.safeParse({ ...valid, email: 'invalid-email' })
      expect(result.success).toBe(false)
    })

    it('rejects empty API token', () => {
      const result = saveJiraCredentialsSchema.safeParse({ ...valid, apiToken: '' })
      expect(result.success).toBe(false)
    })

    it('accepts optional webhook secret', () => {
      const result = saveJiraCredentialsSchema.safeParse({ ...valid, webhookSecret: 'secret123' })
      expect(result.success).toBe(true)
    })
  })

  describe('saveGithubCredentialsSchema', () => {
    const valid = {
      integration: 'github',
      oauthToken: 'ghp_abc123',
    }

    it('validates valid GitHub credentials', () => {
      const result = saveGithubCredentialsSchema.safeParse(valid)
      expect(result.success).toBe(true)
    })

    it('rejects empty OAuth token', () => {
      const result = saveGithubCredentialsSchema.safeParse({ ...valid, oauthToken: '' })
      expect(result.success).toBe(false)
    })

    it('accepts optional webhook secret', () => {
      const result = saveGithubCredentialsSchema.safeParse({ ...valid, webhookSecret: 'secret456' })
      expect(result.success).toBe(true)
    })
  })

  describe('saveAnthropicCredentialsSchema', () => {
    const valid = {
      integration: 'anthropic',
      apiKey: 'sk-ant-abc123',
    }

    it('validates valid Anthropic credentials', () => {
      const result = saveAnthropicCredentialsSchema.safeParse(valid)
      expect(result.success).toBe(true)
    })

    it('rejects empty API key', () => {
      const result = saveAnthropicCredentialsSchema.safeParse({ ...valid, apiKey: '' })
      expect(result.success).toBe(false)
    })
  })

  describe('saveCredentialsSchema discriminated union', () => {
    it('validates Jira credentials', () => {
      const result = saveCredentialsSchema.safeParse({
        integration: 'jira',
        baseUrl: 'https://company.atlassian.net',
        email: 'admin@company.com',
        apiToken: 'token123',
      })
      expect(result.success).toBe(true)
    })

    it('validates GitHub credentials', () => {
      const result = saveCredentialsSchema.safeParse({
        integration: 'github',
        oauthToken: 'ghp_token',
      })
      expect(result.success).toBe(true)
    })

    it('validates Anthropic credentials', () => {
      const result = saveCredentialsSchema.safeParse({
        integration: 'anthropic',
        apiKey: 'sk-ant-key',
      })
      expect(result.success).toBe(true)
    })

    it('rejects unknown integration in union', () => {
      const result = saveCredentialsSchema.safeParse({
        integration: 'slack',
        token: 'abc',
      })
      expect(result.success).toBe(false)
    })
  })
})
