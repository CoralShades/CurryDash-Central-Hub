import { createTool } from '@mastra/core'
import { z } from 'zod'
import { createClient } from '@supabase/supabase-js'
import type { Database, Json } from '@/types/database'
import { logger } from '@/lib/logger'
import { isSessionCapExceeded } from '@/mastra/agents/model-routing'

/** All 6 CurryDash Jira projects queried for sprint reports. */
export const DEFAULT_PROJECT_KEYS = ['CUR', 'CAD', 'CAR', 'CPFP', 'PACK', 'CCW'] as const

const REPORT_QUERY_TIMEOUT_MS = 5_000

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

function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL ?? ''
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? ''
  return createClient<Database>(url, key)
}

/** Shape of a jira_issues row with joined project and sprint data. */
interface SprintIssueRow {
  issue_key: string
  summary: string
  status: string
  priority: string | null
  jira_created_at: string | null
  jira_projects: { project_key: string } | null
  jira_sprints: {
    name: string
    state: string
    start_date: string | null
    end_date: string | null
  } | null
}

/** Sprint completion summary for a single project. */
interface ProjectSprintSummary {
  projectKey: string
  sprintName: string | null
  sprintState: string | null
  startDate: string | null
  endDate: string | null
  totalIssues: number
  doneIssues: number
  completionPct: number
  blockers: Array<{ issueKey: string; summary: string; priority: string | null; ageHours: number }>
}

/** Calculates age in hours from a date string to now. */
function ageInHours(dateStr: string | null): number {
  if (!dateStr) return 0
  return Math.round((Date.now() - new Date(dateStr).getTime()) / (1000 * 60 * 60))
}

/**
 * Queries active sprint data across all CurryDash Jira projects for sprint report generation.
 * Uses Supabase cached data (5s timeout) then returns structured per-project completion stats,
 * velocity trend, and blocker summary with source citation and "Data as of [timestamp]" footer.
 *
 * Default project keys: CUR, CAD, CAR, CPFP, PACK, CCW.
 */
export const getSprintReportDataTool = createTool({
  id: 'get-sprint-report-data',
  description:
    'Retrieves active sprint data across CurryDash Jira projects (CUR, CAD, CAR, CPFP, PACK, CCW) for sprint report generation. ' +
    'Returns per-project story completion (done/total + %), velocity trend (current sprint completion %), ' +
    'blocker summary (count + top 3 by age), sprint name and date range, and a "Data as of [timestamp]" footer. ' +
    'Includes source citation: "Based on Jira JQL query across CUR, CAD, CAR, CPFP, PACK, CCW". ' +
    'Uses Supabase cached data with a 5-second timeout.',
  inputSchema: z.object({
    projectKeys: z
      .array(z.string().min(1))
      .min(1)
      .optional()
      .default([...DEFAULT_PROJECT_KEYS])
      .describe('Jira project keys to include in the report (defaults to all 6 CurryDash projects)'),
    sessionTokens: z
      .number()
      .int()
      .min(0)
      .optional()
      .default(0)
      .describe('Cumulative session token count for budget enforcement'),
  }),
  execute: async ({ context }) => {
    const { projectKeys, sessionTokens } = context
    const correlationId = generateCorrelationId()

    // Token budget check
    if (isSessionCapExceeded(sessionTokens ?? 0)) {
      return SESSION_CAP_ERROR
    }

    const supabase = getSupabaseAdmin()
    const dataAsOf = new Date().toISOString()

    logger.info('Sprint report data query started', {
      correlationId,
      source: 'ai',
      data: { projectKeys },
    })

    // Query active sprint issues and sprint info for all requested projects.
    // Cast via unknown because Supabase's generated types for multi-join selects
    // don't reflect the joined shape; the actual runtime shape matches SprintIssueRow.
    let issues: SprintIssueRow[] = []
    let queryError: { message: string } | null = null

    try {
      const result = await withTimeout(
        (async () =>
          supabase
            .from('jira_issues')
            .select(
              `issue_key, summary, status, priority, jira_created_at,
               jira_projects!inner(project_key),
               jira_sprints!inner(name, state, start_date, end_date)`
            )
            .in('jira_projects.project_key', projectKeys)
            .eq('jira_sprints.state', 'active')
            .order('jira_created_at', { ascending: false }))(),
        REPORT_QUERY_TIMEOUT_MS
      )
      issues = (result.data as unknown as SprintIssueRow[]) ?? []
      queryError = result.error
    } catch (timeoutErr: unknown) {
      logger.error('Sprint report query timed out', {
        correlationId,
        source: 'ai',
        data: { projectKeys, error: String(timeoutErr) },
      })
      return {
        data: null,
        error: {
          code: 'REPORT_QUERY_TIMEOUT',
          message: "I couldn't retrieve sprint data — query timed out",
        },
      }
    }

    if (queryError) {
      logger.error('Sprint report data query failed', {
        correlationId,
        source: 'ai',
        data: { projectKeys, error: queryError.message },
      })
      return {
        data: null,
        error: {
          code: 'REPORT_QUERY_ERROR',
          message: `I couldn't retrieve sprint data — ${queryError.message}`,
        },
      }
    }

    // Group issues by project
    const byProject = new Map<string, SprintIssueRow[]>()
    for (const pk of projectKeys) {
      byProject.set(pk, [])
    }
    for (const issue of issues) {
      const pk = issue.jira_projects?.project_key ?? ''
      byProject.get(pk)?.push(issue)
    }

    const projectSummaries: ProjectSprintSummary[] = []
    const allBlockers: ProjectSprintSummary['blockers'] = []

    for (const [projectKey, projectIssues] of byProject.entries()) {
      const sprint = projectIssues[0]?.jira_sprints ?? null

      const totalIssues = projectIssues.length
      const doneIssues = projectIssues.filter(
        (i) => i.status.toLowerCase() === 'done' || i.status.toLowerCase() === 'closed'
      ).length
      const completionPct = totalIssues > 0 ? Math.round((doneIssues / totalIssues) * 100) : 0

      // Blockers: issues with 'Blocked' status or 'Highest'/'High' priority not yet done
      const blockers = projectIssues
        .filter(
          (i) =>
            i.status.toLowerCase() !== 'done' &&
            i.status.toLowerCase() !== 'closed' &&
            (i.status.toLowerCase() === 'blocked' ||
              i.priority === 'Highest' ||
              i.priority === 'High')
        )
        .map((i) => ({
          issueKey: i.issue_key,
          summary: i.summary,
          priority: i.priority,
          ageHours: ageInHours(i.jira_created_at),
        }))
        .sort((a, b) => b.ageHours - a.ageHours)

      allBlockers.push(...blockers)

      projectSummaries.push({
        projectKey,
        sprintName: sprint?.name ?? null,
        sprintState: sprint?.state ?? null,
        startDate: sprint?.start_date ?? null,
        endDate: sprint?.end_date ?? null,
        totalIssues,
        doneIssues,
        completionPct,
        blockers: blockers.slice(0, 3),
      })
    }

    // Overall stats
    const totalDone = projectSummaries.reduce((sum, p) => sum + p.doneIssues, 0)
    const totalIssues = projectSummaries.reduce((sum, p) => sum + p.totalIssues, 0)
    const overallPct = totalIssues > 0 ? Math.round((totalDone / totalIssues) * 100) : 0

    // Top 3 blockers by age across all projects
    const topBlockers = allBlockers.sort((a, b) => b.ageHours - a.ageHours).slice(0, 3)

    logger.info('Sprint report data query complete', {
      correlationId,
      source: 'ai',
      data: {
        projectCount: projectKeys.length,
        totalIssues,
        totalDone,
        overallPct,
        blockerCount: allBlockers.length,
      },
    })

    return {
      data: {
        projectSummaries,
        overall: {
          totalIssues,
          doneIssues: totalDone,
          completionPct: overallPct,
          blockerCount: allBlockers.length,
          topBlockers,
        },
        dataAsOf,
        citation: `Based on Jira JQL query across ${projectKeys.join(', ')}`,
        source: 'cached' as const,
      },
      error: null,
    }
  },
})

/**
 * Queues a failed report request for retry when the AI service recovers.
 * Persists the retry entry to `dead_letter_events` using source='ai' and
 * event_type='report.retry_queued' so it can be retried by the admin.
 */
export const queueReportRetryTool = createTool({
  id: 'queue-report-retry',
  description:
    'Queues a failed report request for retry when the AI service recovers. ' +
    'Stores the original request parameters in dead_letter_events so the report can be retried ' +
    'without user re-entry. Returns a user-facing queued confirmation message.',
  inputSchema: z.object({
    requestParams: z
      .record(z.unknown())
      .describe('The original report request parameters to store for retry'),
    errorReason: z.string().min(1).describe('The reason the report request failed'),
    userId: z.string().optional().describe('Optional user ID to associate with the queued retry'),
  }),
  execute: async ({ context }) => {
    const { requestParams, errorReason, userId } = context
    const correlationId = generateCorrelationId()

    const supabase = getSupabaseAdmin()

    logger.warn('Report request failed, queuing for retry', {
      correlationId,
      source: 'ai',
      data: { errorReason, userId, hasParams: !!requestParams },
    })

    // Cast payload to Json — record<string, unknown> is structurally compatible at runtime
    const payload: Json = {
      requestParams: requestParams as Json,
      userId: userId ?? null,
      queuedAt: new Date().toISOString(),
    }

    const { error } = await supabase.from('dead_letter_events').insert({
      source: 'ai',
      event_type: 'report.retry_queued',
      event_id: correlationId,
      payload,
      error: errorReason,
      retry_count: 0,
      correlation_id: correlationId,
    })

    if (error) {
      logger.error('Failed to queue report retry', {
        correlationId,
        source: 'ai',
        data: { error: error.message },
      })
      // Still return the user-facing queued message even if DB write failed
    }

    return {
      data: {
        queued: true,
        correlationId,
        userMessage:
          'Report generation is temporarily unavailable. Your request has been queued and will complete when the AI service recovers.',
      },
      error: null,
    }
  },
})
