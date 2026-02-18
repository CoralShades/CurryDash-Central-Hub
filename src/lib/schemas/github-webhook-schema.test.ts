import { describe, it, expect } from 'vitest'
import {
  githubWebhookEventSchema,
  githubPushPayloadSchema,
  githubPrPayloadSchema,
  githubWorkflowRunPayloadSchema,
} from './github-webhook-schema'

const minimalRepo = {
  id: 123456,
  full_name: 'org/repo',
  name: 'repo',
  default_branch: 'main',
  private: false,
}

describe('githubWebhookEventSchema', () => {
  it('accepts a minimal event with no repository', () => {
    const result = githubWebhookEventSchema.safeParse({ action: 'opened' })
    expect(result.success).toBe(true)
  })

  it('accepts a full event with repository and sender', () => {
    const result = githubWebhookEventSchema.safeParse({
      action: 'opened',
      repository: minimalRepo,
      sender: { login: 'dev', avatar_url: 'https://example.com/avatar.jpg' },
    })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.repository?.full_name).toBe('org/repo')
    }
  })

  it('accepts empty object (all fields optional)', () => {
    const result = githubWebhookEventSchema.safeParse({})
    expect(result.success).toBe(true)
  })
})

describe('githubPushPayloadSchema', () => {
  const minimalPush = {
    ref: 'refs/heads/main',
    before: 'abc123',
    after: 'def456',
    repository: minimalRepo,
  }

  it('accepts a minimal push payload', () => {
    const result = githubPushPayloadSchema.safeParse(minimalPush)
    expect(result.success).toBe(true)
  })

  it('accepts a push payload with commits', () => {
    const withCommits = {
      ...minimalPush,
      commits: [
        {
          id: 'sha1',
          message: 'fix: typo',
          timestamp: '2026-02-18T10:00:00Z',
          author: { name: 'Dev', email: 'dev@example.com' },
        },
      ],
      pusher: { name: 'Dev', email: 'dev@example.com' },
    }
    const result = githubPushPayloadSchema.safeParse(withCommits)
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.commits).toHaveLength(1)
    }
  })

  it('rejects when ref is missing', () => {
    const result = githubPushPayloadSchema.safeParse({
      before: minimalPush.before,
      after: minimalPush.after,
      repository: minimalPush.repository,
    })
    expect(result.success).toBe(false)
  })
})

describe('githubPrPayloadSchema', () => {
  const minimalPr = {
    number: 42,
    repository: minimalRepo,
    pull_request: {
      number: 42,
      title: 'Add feature X',
      state: 'open',
      user: { login: 'dev', avatar_url: 'https://example.com/avatar.jpg' },
      head: { ref: 'feature/x', sha: 'abc123' },
      base: { ref: 'main' },
      created_at: '2026-02-18T09:00:00Z',
      updated_at: '2026-02-18T10:00:00Z',
    },
  }

  it('accepts a minimal PR payload', () => {
    const result = githubPrPayloadSchema.safeParse(minimalPr)
    expect(result.success).toBe(true)
  })

  it('accepts a full PR payload with optional fields', () => {
    const full = {
      ...minimalPr,
      action: 'opened',
      pull_request: {
        ...minimalPr.pull_request,
        draft: false,
        additions: 25,
        deletions: 5,
        changed_files: 3,
        merged_at: null,
      },
    }
    const result = githubPrPayloadSchema.safeParse(full)
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.pull_request.additions).toBe(25)
    }
  })

  it('rejects when pull_request is missing', () => {
    const result = githubPrPayloadSchema.safeParse({ number: 42, repository: minimalRepo })
    expect(result.success).toBe(false)
  })
})

describe('githubWorkflowRunPayloadSchema', () => {
  const minimalWorkflow = {
    repository: minimalRepo,
    workflow_run: {
      id: 9876,
      status: 'completed',
      conclusion: 'success',
      head_sha: 'abc123',
      html_url: 'https://github.com/org/repo/actions/runs/9876',
      created_at: '2026-02-18T09:00:00Z',
      updated_at: '2026-02-18T09:05:00Z',
    },
  }

  it('accepts a minimal workflow run payload', () => {
    const result = githubWorkflowRunPayloadSchema.safeParse(minimalWorkflow)
    expect(result.success).toBe(true)
  })

  it('accepts a workflow run with null conclusion (in_progress)', () => {
    const inProgress = {
      ...minimalWorkflow,
      workflow_run: {
        ...minimalWorkflow.workflow_run,
        status: 'in_progress',
        conclusion: null,
        name: 'CI',
        head_branch: 'main',
        workflow_id: 12345,
      },
      workflow: { name: 'CI Pipeline' },
    }
    const result = githubWorkflowRunPayloadSchema.safeParse(inProgress)
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.workflow_run.conclusion).toBeNull()
    }
  })

  it('rejects when workflow_run is missing', () => {
    const result = githubWorkflowRunPayloadSchema.safeParse({ repository: minimalRepo })
    expect(result.success).toBe(false)
  })
})
