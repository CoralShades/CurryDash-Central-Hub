import { z } from 'zod'

/**
 * Jira webhook event schema — validates the top-level envelope that Jira sends.
 * All Jira Cloud webhooks include: webhookEvent, timestamp, and an optional issue.
 */
export const jiraWebhookEventSchema = z.object({
  webhookEvent: z.string().min(1),
  timestamp: z.number().optional(),
  issue: z.object({
    id: z.string(),
    key: z.string(),
    fields: z.object({
      summary: z.string(),
      description: z.unknown().optional(),
      issuetype: z.object({ name: z.string() }),
      status: z.object({ name: z.string() }),
      priority: z.object({ name: z.string() }).optional().nullable(),
      assignee: z.object({ emailAddress: z.string() }).optional().nullable(),
      reporter: z.object({ emailAddress: z.string() }).optional().nullable(),
      story_points: z.number().optional().nullable(),
      customfield_10016: z.number().optional().nullable(), // story points (common field)
      labels: z.array(z.string()).optional(),
      updated: z.string().optional(),
      created: z.string().optional(),
    }),
  }).optional(),
  sprint: z.object({
    id: z.number(),
    name: z.string(),
    state: z.string(),
  }).optional().nullable(),
  user: z.object({
    emailAddress: z.string().optional(),
  }).optional().nullable(),
})

export type JiraWebhookEvent = z.infer<typeof jiraWebhookEventSchema>

/**
 * Jira issue payload schema — the validated issue shape for DB upsert.
 * Maps Jira webhook fields to jira_issues table columns.
 */
export const jiraIssuePayloadSchema = z.object({
  issue_key: z.string().min(1),
  summary: z.string(),
  description: z.string().nullable().optional(),
  issue_type: z.string(),
  status: z.string(),
  priority: z.string().nullable().optional(),
  assignee_email: z.string().nullable().optional(),
  reporter_email: z.string().nullable().optional(),
  story_points: z.number().nullable().optional(),
  labels: z.array(z.string()).optional(),
  jira_updated_at: z.string().nullable().optional(),
  jira_created_at: z.string().nullable().optional(),
})

export type JiraIssuePayload = z.infer<typeof jiraIssuePayloadSchema>
