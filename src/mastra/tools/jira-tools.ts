import { createTool } from '@mastra/core'
import { z } from 'zod'
import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'
import { logger } from '@/lib/logger'
import { getActiveSprintIssues, getJiraProjects } from '@/lib/clients/jira-client'
import { isSessionCapExceeded } from '@/mastra/agents/model-routing'

/** Races a promise against a ms-duration timeout rejection. */
function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error(`Timeout after ${ms}ms`)), ms)
    ),
  ])
}

function generateCorrelationId(): string {
  return `ai-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`
}

const SESSION_CAP_ERROR = {
  data: null,
  error: {
    code: 'SESSION_CAP_EXCEEDED',
    message:
      "I've reached the query limit for this session. Start a new chat for more questions.",
  },
} as const

const JIRA_LIVE_TIMEOUT_MS = 5_000

function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL ?? ''
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? ''
  return createClient<Database>(url, key)
}

export const getActiveSprintIssuesTool = createTool({
  id: 'get-active-sprint-issues',
  description:
    'Retrieves active sprint issues for a Jira project. Attempts a live Jira API query (5s timeout); falls back to Supabase cache on failure. Response includes a source citation: "Live query" or "Cached data as of [timestamp]".',
  inputSchema: z.object({
    projectKey: z.string().min(1).describe('The Jira project key, e.g. "CD"'),
    limit: z.number().int().min(1).max(200).optional().default(50),
    sessionTokens: z
      .number()
      .int()
      .min(0)
      .optional()
      .default(0)
      .describe('Cumulative session token count for budget enforcement'),
  }),
  execute: async ({ context }) => {
    const { projectKey, limit, sessionTokens } = context
    const correlationId = generateCorrelationId()

    // Token budget check
    if (isSessionCapExceeded(sessionTokens ?? 0)) {
      return SESSION_CAP_ERROR
    }

    // Attempt live Jira API query
    try {
      const liveIssues = await withTimeout(getActiveSprintIssues(projectKey), JIRA_LIVE_TIMEOUT_MS)
      const sliced = liveIssues.slice(0, limit ?? 50)

      logger.info('Jira live query succeeded', {
        correlationId,
        source: 'ai',
        data: { projectKey, count: sliced.length },
      })

      return {
        data: { issues: sliced },
        source: 'live' as const,
        citation: `Live query — Jira JQL: project = ${projectKey} AND sprint in openSprints()`,
        error: null,
      }
    } catch (liveError: unknown) {
      const isTimeout = liveError instanceof Error && liveError.message.startsWith('Timeout')
      logger.warn('Jira live query failed, falling back to Supabase cache', {
        correlationId,
        source: 'ai',
        data: {
          projectKey,
          error: liveError instanceof Error ? liveError.message : String(liveError),
          isTimeout,
        },
      })
    }

    // Fallback: Supabase cached data
    const supabase = getSupabaseAdmin()
    const { data, error } = await supabase
      .from('jira_issues')
      .select(
        `id, issue_key, summary, status, priority, assignee_email, raw_payload, updated_at,
         jira_projects!inner(project_key)`
      )
      .eq('jira_projects.project_key', projectKey)
      .not('jira_sprint_id', 'is', null)
      .order('updated_at', { ascending: false })
      .limit(limit ?? 50)

    if (error) {
      logger.error('Jira cache fallback also failed', {
        correlationId,
        source: 'ai',
        data: { projectKey, error: error.message },
      })
      return {
        data: null,
        error: { code: 'JIRA_API_ERROR', message: `I couldn't retrieve that data — ${error.message}` },
      }
    }

    const cachedAt = new Date().toISOString()
    return {
      data: { issues: data ?? [] },
      source: 'cached' as const,
      citation: `Cached data as of ${cachedAt} — Jira project ${projectKey}`,
      error: null,
    }
  },
})

export const getJiraProjectsSummaryTool = createTool({
  id: 'get-jira-projects-summary',
  description:
    'Returns a summary of all Jira projects. Attempts a live Jira API query (5s timeout); falls back to Supabase cache on failure. Response includes a source citation.',
  inputSchema: z.object({
    sessionTokens: z
      .number()
      .int()
      .min(0)
      .optional()
      .default(0)
      .describe('Cumulative session token count for budget enforcement'),
  }),
  execute: async ({ context }) => {
    const { sessionTokens } = context
    const correlationId = generateCorrelationId()

    // Token budget check
    if (isSessionCapExceeded(sessionTokens ?? 0)) {
      return SESSION_CAP_ERROR
    }

    // Attempt live Jira API query
    try {
      const liveProjects = await withTimeout(getJiraProjects(), JIRA_LIVE_TIMEOUT_MS)

      logger.info('Jira projects live query succeeded', {
        correlationId,
        source: 'ai',
        data: { count: liveProjects.length },
      })

      return {
        data: { projects: liveProjects },
        source: 'live' as const,
        citation: 'Live query — Jira projects API',
        error: null,
      }
    } catch (liveError: unknown) {
      logger.warn('Jira projects live query failed, falling back to Supabase cache', {
        correlationId,
        source: 'ai',
        data: {
          error: liveError instanceof Error ? liveError.message : String(liveError),
        },
      })
    }

    // Fallback: Supabase cached data
    const supabase = getSupabaseAdmin()
    const { data, error } = await supabase
      .from('jira_projects')
      .select('id, project_key, name, synced_at')
      .order('name', { ascending: true })

    if (error) {
      logger.error('Jira projects cache fallback also failed', {
        correlationId,
        source: 'ai',
        data: { error: error.message },
      })
      return {
        data: null,
        error: { code: 'JIRA_API_ERROR', message: `I couldn't retrieve that data — ${error.message}` },
      }
    }

    const cachedAt = new Date().toISOString()
    return {
      data: { projects: data ?? [] },
      source: 'cached' as const,
      citation: `Cached data as of ${cachedAt} — Jira projects`,
      error: null,
    }
  },
})
