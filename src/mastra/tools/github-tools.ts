import { createTool } from '@mastra/core'
import { z } from 'zod'
import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'
import { logger } from '@/lib/logger'

function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL ?? ''
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? ''
  return createClient<Database>(url, key)
}

const PR_STATE_VALUES = ['open', 'closed', 'merged'] as const

export const getPullRequestsTool = createTool({
  id: 'get-pull-requests',
  description:
    'Retrieves GitHub pull requests from the Supabase cache. Filter by state (open, closed, merged) and limit results.',
  inputSchema: z.object({
    state: z.enum(PR_STATE_VALUES).optional().describe('Filter by PR state'),
    limit: z.number().int().min(1).max(100).optional().default(20),
    repoFullName: z
      .string()
      .optional()
      .describe('Filter by repository full name, e.g. "org/repo"'),
  }),
  execute: async ({ context }) => {
    const { state, limit, repoFullName } = context
    const supabase = getSupabaseAdmin()

    let query = supabase
      .from('github_pull_requests')
      .select(
        `id, pr_number, title, state, author_login, head_branch, base_branch, additions, deletions,
         changed_files, is_draft, merged_at, github_created_at,
         github_repos!inner(full_name, name)`
      )
      .order('github_created_at', { ascending: false })
      .limit(limit ?? 20)

    if (state === 'merged') {
      query = query.not('merged_at', 'is', null)
    } else if (state === 'open' || state === 'closed') {
      query = query.eq('state', state)
    }

    if (repoFullName) {
      query = query.eq('github_repos.full_name', repoFullName)
    }

    const { data, error } = await query

    if (error) {
      logger.warn('Failed to fetch pull requests', {
        source: 'ai',
        data: { error: error.message },
      })
      return { pullRequests: [], error: error.message }
    }

    return { pullRequests: data ?? [] }
  },
})

export const getWorkflowRunsTool = createTool({
  id: 'get-workflow-runs',
  description:
    'Retrieves recent GitHub Actions workflow runs from the Supabase cache. Shows status, conclusion, duration, and triggering branch.',
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
  }),
  execute: async ({ context }) => {
    const { limit, repoFullName, conclusion } = context
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
      logger.warn('Failed to fetch workflow runs', {
        source: 'ai',
        data: { error: error.message },
      })
      return { workflowRuns: [], error: error.message }
    }

    return { workflowRuns: data ?? [] }
  },
})
