import { z } from 'zod'

/**
 * Top-level GitHub webhook event envelope.
 * The X-GitHub-Event header determines which sub-schema to use.
 */
export const githubWebhookEventSchema = z.object({
  action: z.string().optional(),
  repository: z.object({
    id: z.number(),
    full_name: z.string(),
    name: z.string(),
    default_branch: z.string().optional(),
    private: z.boolean().optional(),
    language: z.string().nullable().optional(),
    stargazers_count: z.number().optional(),
    open_issues_count: z.number().optional(),
  }).optional(),
  sender: z.object({
    login: z.string(),
    avatar_url: z.string().optional(),
  }).optional(),
})

export type GitHubWebhookEvent = z.infer<typeof githubWebhookEventSchema>

/**
 * GitHub push event payload schema.
 * Sent on every push to a branch.
 */
export const githubPushPayloadSchema = githubWebhookEventSchema.extend({
  ref: z.string(),
  before: z.string(),
  after: z.string(),
  commits: z.array(
    z.object({
      id: z.string(),
      message: z.string(),
      timestamp: z.string(),
      author: z.object({
        name: z.string(),
        email: z.string().optional(),
      }),
      added: z.array(z.string()).optional(),
      removed: z.array(z.string()).optional(),
      modified: z.array(z.string()).optional(),
    })
  ).optional(),
  head_commit: z.object({
    id: z.string(),
    message: z.string(),
    timestamp: z.string(),
    author: z.object({ name: z.string(), email: z.string().optional() }),
  }).optional().nullable(),
  pusher: z.object({
    name: z.string(),
    email: z.string().optional(),
  }).optional(),
})

export type GitHubPushPayload = z.infer<typeof githubPushPayloadSchema>

/**
 * GitHub pull_request event payload schema.
 * Sent on PR open/close/reopen/sync/review/merge.
 */
export const githubPrPayloadSchema = githubWebhookEventSchema.extend({
  number: z.number(),
  pull_request: z.object({
    number: z.number(),
    title: z.string(),
    state: z.string(),
    draft: z.boolean().optional(),
    user: z.object({
      login: z.string(),
      avatar_url: z.string().optional(),
    }),
    head: z.object({ ref: z.string(), sha: z.string() }),
    base: z.object({ ref: z.string() }),
    additions: z.number().optional(),
    deletions: z.number().optional(),
    changed_files: z.number().optional(),
    merged_at: z.string().nullable().optional(),
    created_at: z.string(),
    updated_at: z.string(),
  }),
})

export type GitHubPrPayload = z.infer<typeof githubPrPayloadSchema>

/**
 * GitHub workflow_run event payload schema.
 * Sent on CI/CD workflow completion.
 */
export const githubWorkflowRunPayloadSchema = githubWebhookEventSchema.extend({
  workflow_run: z.object({
    id: z.number(),
    name: z.string().optional(),
    status: z.string(),
    conclusion: z.string().nullable().optional(),
    head_branch: z.string().optional().nullable(),
    head_sha: z.string(),
    workflow_id: z.number().optional(),
    html_url: z.string(),
    created_at: z.string(),
    updated_at: z.string(),
  }),
  workflow: z.object({
    name: z.string(),
  }).optional(),
})

export type GitHubWorkflowRunPayload = z.infer<typeof githubWorkflowRunPayloadSchema>
