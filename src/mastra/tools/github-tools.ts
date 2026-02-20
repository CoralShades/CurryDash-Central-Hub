import { createTool } from '@mastra/core'
import { z } from 'zod'
import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'
import { logger } from '@/lib/logger'
import {
  getPullRequests as getLivePullRequests,
  getWorkflowRuns as getLiveWorkflowRuns,
} from '@/lib/clients/github-client'
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

const GITHUB_LIVE_TIMEOUT_MS = 5_000

const PR_STATE_VALUES = ['open', 'closed', 'merged'] as const

function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL ?? ''
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? ''
  return createClient<Database>(url, key)
}

export const getPullRequestsTool = createTool({
  id: 'get-pull-requests',
  description:
    'Retrieves GitHub pull requests. When repoFullName is provided, attempts a live GitHub API query (5s timeout); falls back to Supabase cache on failure or when no repo is specified. Response includes a source citation: "Live query" or "Cached data as of [timestamp]".',
  inputSchema: z.object({
    state: z.enum(PR_STATE_VALUES).optional().describe('Filter by PR state'),
    limit: z.number().int().min(1).max(100).optional().default(20),
    repoFullName: z
      .string()
      .optional()
      .describe('Filter by repository full name, e.g. "org/repo"'),
    sessionTokens: z
      .number()
      .int()
      .min(0)
      .optional()
      .default(0)
      .describe('Cumulative session token count for budget enforcement'),
  }),
  execute: async ({ context }) => {
    const { state, limit, repoFullName, sessionTokens } = context
    const correlationId = generateCorrelationId()

    // Token budget check
    if (isSessionCapExceeded(sessionTokens ?? 0)) {
      return SESSION_CAP_ERROR
    }

    // Attempt live GitHub API query when repo is known
    if (repoFullName) {
      const slashIndex = repoFullName.indexOf('/')
      if (slashIndex > 0) {
        const owner = repoFullName.slice(0, slashIndex)
        const repo = repoFullName.slice(slashIndex + 1)

        try {
          const apiState = state === 'merged' ? 'closed' : (state ?? 'open')
          const livePRs = await withTimeout(
            getLivePullRequests(owner, repo, apiState as 'open' | 'closed' | 'all'),
            GITHUB_LIVE_TIMEOUT_MS
          )

          // Filter merged PRs post-fetch
          const filtered =
            state === 'merged'
              ? livePRs.filter((pr) => pr.mergedAt !== null)
              : livePRs

          const sliced = filtered.slice(0, limit ?? 20)

          logger.info('GitHub PRs live query succeeded', {
            correlationId,
            source: 'ai',
            data: { repoFullName, state, count: sliced.length },
          })

          return {
            data: { pullRequests: sliced },
            source: 'live' as const,
            citation: `Live query — From GitHub API: ${repoFullName}`,
            error: null,
          }
        } catch (liveError: unknown) {
          const isTimeout = liveError instanceof Error && liveError.message.startsWith('Timeout')
          logger.warn('GitHub PRs live query failed, falling back to Supabase cache', {
            correlationId,
            source: 'ai',
            data: {
              repoFullName,
              error: liveError instanceof Error ? liveError.message : String(liveError),
              isTimeout,
            },
          })
        }
      }
    }

    // Fallback: Supabase cached data
    const supabase = getSupabaseAdmin()

    let query = supabase
      .from('github_pull_requests')
      .select(
        `id, pr_number, title, state, author, head_branch, base_branch, raw_payload,
         github_repos!inner(full_name, name)`
      )
      .order('created_at', { ascending: false })
      .limit(limit ?? 20)

    if (state === 'merged' || state === 'closed') {
      query = query.eq('state', 'closed')
    } else if (state === 'open') {
      query = query.eq('state', state)
    }

    if (repoFullName) {
      query = query.eq('github_repos.full_name', repoFullName)
    }

    const { data, error } = await query

    if (error) {
      logger.error('GitHub PRs cache fallback failed', {
        correlationId,
        source: 'ai',
        data: { error: error.message },
      })
      return {
        data: null,
        error: { code: 'GITHUB_API_ERROR', message: `I couldn't retrieve that data — ${error.message}` },
      }
    }

    const cachedAt = new Date().toISOString()
    const citation = repoFullName
      ? `Cached data as of ${cachedAt} — From GitHub API: ${repoFullName}`
      : `Cached data as of ${cachedAt} — GitHub pull requests`

    return {
      data: { pullRequests: data ?? [] },
      source: 'cached' as const,
      citation,
      error: null,
    }
  },
})

export const getWorkflowRunsTool = createTool({
  id: 'get-workflow-runs',
  description:
    'Retrieves recent GitHub Actions workflow runs. When repoFullName is provided, attempts a live GitHub API query (5s timeout); falls back to Supabase cache on failure. Response includes a source citation.',
  inputSchema: z.object({
    limit: z.number().int().min(1).max(100).optional().default(20),
    repoFullName: z
      .string()
      .optional()
      .describe('Filter by repository full name, e.g. "org/repo"'),
    conclusion: z
      .enum(['success', 'failure', 'cancelled', 'skipped'])
      .optional()
      .describe('Filter by workflow conclusion'),
    sessionTokens: z
      .number()
      .int()
      .min(0)
      .optional()
      .default(0)
      .describe('Cumulative session token count for budget enforcement'),
  }),
  execute: async ({ context }) => {
    const { limit, repoFullName, conclusion, sessionTokens } = context
    const correlationId = generateCorrelationId()

    // Token budget check
    if (isSessionCapExceeded(sessionTokens ?? 0)) {
      return SESSION_CAP_ERROR
    }

    // Attempt live GitHub API query when repo is known
    if (repoFullName) {
      const slashIndex = repoFullName.indexOf('/')
      if (slashIndex > 0) {
        const owner = repoFullName.slice(0, slashIndex)
        const repo = repoFullName.slice(slashIndex + 1)

        try {
          const liveRuns = await withTimeout(
            getLiveWorkflowRuns(owner, repo),
            GITHUB_LIVE_TIMEOUT_MS
          )

          const filtered = conclusion
            ? liveRuns.filter((r) => r.conclusion === conclusion)
            : liveRuns

          const sliced = filtered.slice(0, limit ?? 20)

          logger.info('GitHub workflow runs live query succeeded', {
            correlationId,
            source: 'ai',
            data: { repoFullName, conclusion, count: sliced.length },
          })

          return {
            data: { workflowRuns: sliced },
            source: 'live' as const,
            citation: `Live query — From GitHub API: ${repoFullName}`,
            error: null,
          }
        } catch (liveError: unknown) {
          const isTimeout = liveError instanceof Error && liveError.message.startsWith('Timeout')
          logger.warn('GitHub workflow runs live query failed, falling back to Supabase cache', {
            correlationId,
            source: 'ai',
            data: {
              repoFullName,
              error: liveError instanceof Error ? liveError.message : String(liveError),
              isTimeout,
            },
          })
        }
      }
    }

    // Fallback: Supabase cached data
    const supabase = getSupabaseAdmin()

    let query = supabase
      .from('github_workflow_runs')
      .select(
        `id, run_id, workflow_name, head_branch, status, conclusion, duration_seconds,
         html_url, github_created_at,
         github_repos!inner(full_name, name)`
      )
      .order('github_created_at', { ascending: false })
      .limit(limit ?? 20)

    if (conclusion) {
      query = query.eq('conclusion', conclusion)
    }

    if (repoFullName) {
      query = query.eq('github_repos.full_name', repoFullName)
    }

    const { data, error } = await query

    if (error) {
      logger.error('GitHub workflow runs cache fallback failed', {
        correlationId,
        source: 'ai',
        data: { error: error.message },
      })
      return {
        data: null,
        error: { code: 'GITHUB_API_ERROR', message: `I couldn't retrieve that data — ${error.message}` },
      }
    }

    const cachedAt = new Date().toISOString()
    const citation = repoFullName
      ? `Cached data as of ${cachedAt} — From GitHub API: ${repoFullName}`
      : `Cached data as of ${cachedAt} — GitHub workflow runs`

    return {
      data: { workflowRuns: data ?? [] },
      source: 'cached' as const,
      citation,
      error: null,
    }
  },
})
