import { Version3Client } from 'jira.js'
import { IntegrationError, RateLimitError } from '@/lib/errors'
import { logger } from '@/lib/logger'
import type { JiraIssue, JiraProject, JiraSprint } from '@/types/jira'

const RETRY_DELAYS_MS = [1000, 2000, 4000, 8000]

async function withRetry<T>(fn: () => Promise<T>, attempt = 0): Promise<T> {
  try {
    return await fn()
  } catch (error: unknown) {
    const status = (error as { status?: number })?.status
    if (status === 429 && attempt < RETRY_DELAYS_MS.length) {
      const delay = RETRY_DELAYS_MS[attempt]
      logger.warn('Jira rate limit hit, retrying', {
        source: 'webhook:jira',
        data: { attempt: attempt + 1, delayMs: delay },
      })
      await new Promise((resolve) => setTimeout(resolve, delay))
      return withRetry(fn, attempt + 1)
    }
    if (status === 429) {
      throw new RateLimitError('Jira API rate limit exceeded after max retries')
    }
    throw error
  }
}

function createClient(): Version3Client {
  const host = process.env.JIRA_BASE_URL
  const email = process.env.JIRA_EMAIL
  const apiToken = process.env.JIRA_API_TOKEN

  if (!host || !email || !apiToken) {
    throw new IntegrationError('Jira credentials not configured', {
      missing: [
        !host && 'JIRA_BASE_URL',
        !email && 'JIRA_EMAIL',
        !apiToken && 'JIRA_API_TOKEN',
      ].filter(Boolean),
    })
  }

  return new Version3Client({
    host,
    authentication: {
      basic: { email, apiToken },
    },
  })
}

export async function getJiraProjects(): Promise<JiraProject[]> {
  const client = createClient()
  return withRetry(async () => {
    const response = await client.projects.searchProjects({ maxResults: 50 })
    return (response.values ?? []).map((p) => ({
      id: p.id ?? '',
      key: p.key ?? '',
      name: p.name ?? '',
      description: typeof p.description === 'string' ? p.description : undefined,
    }))
  })
}

interface AgileSprintShape {
  id?: number
  name?: string
  state?: string
  startDate?: string
  endDate?: string
  goal?: string
  originBoardId?: number
}

interface AgileClient {
  board: {
    getAllSprints: (params: {
      boardId: number
      state?: string
    }) => Promise<{ values?: AgileSprintShape[] }>
  }
}

export async function getSprintsForBoard(boardId: number): Promise<JiraSprint[]> {
  const client = createClient()
  return withRetry(async () => {
    const agile = client as unknown as AgileClient
    const response = await agile.board.getAllSprints({ boardId, state: 'active' })
    return (response.values ?? []).map((s) => ({
      id: s.id ?? 0,
      name: s.name ?? '',
      state: (s.state as JiraSprint['state']) ?? 'active',
      startDate: s.startDate,
      endDate: s.endDate,
      goal: s.goal,
      originBoardId: s.originBoardId,
    }))
  })
}

export async function getIssuesByJql(jql: string, maxResults = 100): Promise<JiraIssue[]> {
  const client = createClient()
  return withRetry(async () => {
    const response = await client.issueSearch.searchForIssuesUsingJql({
      jql,
      maxResults,
      fields: [
        'summary',
        'status',
        'priority',
        'assignee',
        'issuetype',
        'created',
        'updated',
        'customfield_10016',
        'customfield_10014',
      ],
    })
    return (response.issues ?? []).map((issue) => {
      const fields = issue.fields as Record<string, unknown>
      const status = fields.status as { name?: string } | undefined
      const priority = fields.priority as { name?: string } | undefined
      const assignee = fields.assignee as
        | { emailAddress?: string; displayName?: string }
        | null
        | undefined
      const issueType = fields.issuetype as { name?: string } | undefined
      return {
        id: issue.id ?? '',
        key: issue.key ?? '',
        summary: typeof fields.summary === 'string' ? fields.summary : '',
        status: status?.name ?? 'Unknown',
        priority: priority?.name,
        assignee: assignee
          ? {
              emailAddress: assignee.emailAddress ?? '',
              displayName: assignee.displayName ?? '',
            }
          : undefined,
        issueType: issueType?.name ?? 'Unknown',
        storyPoints:
          typeof fields.customfield_10016 === 'number' ? fields.customfield_10016 : undefined,
        epicKey:
          typeof fields.customfield_10014 === 'string' ? fields.customfield_10014 : undefined,
        created: typeof fields.created === 'string' ? fields.created : new Date().toISOString(),
        updated: typeof fields.updated === 'string' ? fields.updated : new Date().toISOString(),
        rawPayload: fields,
      }
    })
  })
}

export async function getActiveSprintIssues(projectKey: string): Promise<JiraIssue[]> {
  return getIssuesByJql(
    `project = ${projectKey} AND sprint in openSprints() ORDER BY updated DESC`,
    200
  )
}
