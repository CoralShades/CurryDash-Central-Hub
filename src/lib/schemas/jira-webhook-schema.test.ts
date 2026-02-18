import { describe, it, expect } from 'vitest'
import { jiraWebhookEventSchema, jiraIssuePayloadSchema } from './jira-webhook-schema'

describe('jiraWebhookEventSchema', () => {
  const minimalEvent = {
    webhookEvent: 'jira:issue_updated',
    timestamp: 1708300000000,
  }

  const fullEvent = {
    webhookEvent: 'jira:issue_updated',
    timestamp: 1708300000000,
    issue: {
      id: '10001',
      key: 'CUR-42',
      fields: {
        summary: 'Fix payment timeout',
        issuetype: { name: 'Bug' },
        status: { name: 'In Progress' },
        priority: { name: 'High' },
        assignee: { emailAddress: 'dev@example.com' },
        reporter: { emailAddress: 'pm@example.com' },
        customfield_10016: 3,
        labels: ['payment', 'critical'],
        updated: '2026-02-18T10:00:00.000Z',
        created: '2026-02-18T09:00:00.000Z',
      },
    },
  }

  it('accepts a minimal event (no issue)', () => {
    const result = jiraWebhookEventSchema.safeParse(minimalEvent)
    expect(result.success).toBe(true)
  })

  it('accepts a full event with issue fields', () => {
    const result = jiraWebhookEventSchema.safeParse(fullEvent)
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.issue?.key).toBe('CUR-42')
      expect(result.data.issue?.fields.issuetype.name).toBe('Bug')
    }
  })

  it('rejects when webhookEvent is missing', () => {
    const result = jiraWebhookEventSchema.safeParse({ timestamp: 123 })
    expect(result.success).toBe(false)
  })

  it('rejects when webhookEvent is empty string', () => {
    const result = jiraWebhookEventSchema.safeParse({ webhookEvent: '' })
    expect(result.success).toBe(false)
  })

  it('accepts event without optional sprint field', () => {
    const result = jiraWebhookEventSchema.safeParse(fullEvent)
    expect(result.success).toBe(true)
  })

  it('accepts event with sprint field', () => {
    const withSprint = { ...fullEvent, sprint: { id: 5, name: 'Sprint 12', state: 'active' } }
    const result = jiraWebhookEventSchema.safeParse(withSprint)
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.sprint?.name).toBe('Sprint 12')
    }
  })
})

describe('jiraIssuePayloadSchema', () => {
  const minimalPayload = {
    issue_key: 'CUR-42',
    summary: 'Fix payment timeout',
    issue_type: 'Bug',
    status: 'In Progress',
  }

  it('accepts a minimal payload', () => {
    const result = jiraIssuePayloadSchema.safeParse(minimalPayload)
    expect(result.success).toBe(true)
  })

  it('accepts a full payload with all optional fields', () => {
    const full = {
      ...minimalPayload,
      description: 'Detailed description',
      priority: 'High',
      assignee_email: 'dev@example.com',
      reporter_email: 'pm@example.com',
      story_points: 3,
      labels: ['payment', 'critical'],
      jira_updated_at: '2026-02-18T10:00:00.000Z',
      jira_created_at: '2026-02-18T09:00:00.000Z',
    }
    const result = jiraIssuePayloadSchema.safeParse(full)
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.labels).toEqual(['payment', 'critical'])
    }
  })

  it('rejects when issue_key is missing', () => {
    const result = jiraIssuePayloadSchema.safeParse({
      summary: minimalPayload.summary,
      issue_type: minimalPayload.issue_type,
      status: minimalPayload.status,
    })
    expect(result.success).toBe(false)
  })

  it('rejects when summary is missing', () => {
    const result = jiraIssuePayloadSchema.safeParse({
      issue_key: minimalPayload.issue_key,
      issue_type: minimalPayload.issue_type,
      status: minimalPayload.status,
    })
    expect(result.success).toBe(false)
  })

  it('accepts null for optional nullable fields', () => {
    const withNulls = {
      ...minimalPayload,
      description: null,
      priority: null,
      assignee_email: null,
      story_points: null,
    }
    const result = jiraIssuePayloadSchema.safeParse(withNulls)
    expect(result.success).toBe(true)
  })
})
