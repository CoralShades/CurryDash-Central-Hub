'use server'

import { revalidateTag } from 'next/cache'
import { createAdminClient } from '@/lib/supabase/admin'
import { requireAuth } from '@/lib/auth'
import { logger } from '@/lib/logger'
import type { ApiResponse } from '@/types/api'
import {
  retryEventSchema,
  type RetryEventInput,
} from '../schemas/dead-letter-schema'

// ── Types ─────────────────────────────────────────────────────────────────────

export type DeadLetterStatus = 'pending' | 'retried'

export interface DeadLetterEvent {
  id: string
  source: string
  eventType: string
  eventId: string | null
  payload: unknown
  error: string
  retryCount: number
  lastRetryAt: string | null
  correlationId: string
  createdAt: string
  /** Derived: 'pending' when retryCount === 0, 'retried' otherwise */
  status: DeadLetterStatus
}

export interface WebhookMetrics {
  successRate: number
  eventsToday: number
  eventsYesterday: number
  avgLatencyMs: number
  deadLetterDepth: number
}

export interface RateLimitInfo {
  /** Limit per unit period */
  limit: number
  /** Remaining quota — null if unknown */
  remaining: number | null
  /** ISO timestamp of last 429 response */
  last429At: string | null
  /** ISO timestamp of quota reset */
  resetAt: string | null
}

export interface RateLimitStatus {
  jira: RateLimitInfo & { callsPerMinute: number }
  github: RateLimitInfo & { requestsPerHour: number }
  /** Percent of Jira quota consumed (0–100) */
  jiraUsedPercent: number
  /** Percent of GitHub quota consumed (0–100) */
  githubUsedPercent: number
}

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Maps a DB dead_letter_events row (snake_case) to the camelCase DTO. */
function mapDeadLetterRow(row: {
  id: string
  source: string
  event_type: string
  event_id: string | null
  payload: unknown
  error: string
  retry_count: number
  last_retry_at: string | null
  correlation_id: string
  created_at: string
}): DeadLetterEvent {
  return {
    id: row.id,
    source: row.source,
    eventType: row.event_type,
    eventId: row.event_id,
    payload: row.payload,
    error: row.error,
    retryCount: row.retry_count,
    lastRetryAt: row.last_retry_at,
    correlationId: row.correlation_id,
    createdAt: row.created_at,
    status: row.retry_count > 0 ? 'retried' : 'pending',
  }
}

// ── Server Actions ────────────────────────────────────────────────────────────

/**
 * Fetches all dead letter events ordered by most recent first.
 * Admin-only.
 */
export async function getDeadLetterEvents(): Promise<ApiResponse<DeadLetterEvent[]>> {
  try {
    await requireAuth('admin')

    const supabase = createAdminClient()
    const { data, error: dbError } = await supabase
      .from('dead_letter_events')
      .select(
        'id, source, event_type, event_id, payload, error, retry_count, last_retry_at, correlation_id, created_at'
      )
      .order('created_at', { ascending: false })
      .limit(200)

    if (dbError) {
      logger.error('Failed to fetch dead letter events', {
        source: 'admin',
        data: { error: dbError.message },
      })
      return {
        data: null,
        error: { code: 'DB_ERROR', message: 'Failed to load dead letter events' },
      }
    }

    return { data: (data ?? []).map(mapDeadLetterRow), error: null }
  } catch (err) {
    logger.error('Unexpected error fetching dead letter events', {
      source: 'admin',
      data: { error: err },
    })
    return {
      data: null,
      error: { code: 'SERVER_ERROR', message: 'Failed to load dead letter events' },
    }
  }
}

/**
 * Computes webhook pipeline health metrics from webhook_events and dead_letter_events.
 * Admin-only.
 */
export async function getWebhookMetrics(): Promise<ApiResponse<WebhookMetrics>> {
  try {
    await requireAuth('admin')

    const supabase = createAdminClient()
    const now = new Date()
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const yesterdayStart = new Date(todayStart.getTime() - 86_400_000)

    // Run all counts in parallel
    const [
      totalTodayResult,
      processedTodayResult,
      processedYesterdayResult,
      deadLetterResult,
      latencyResult,
    ] = await Promise.all([
      supabase
        .from('webhook_events')
        .select('id', { count: 'exact', head: true })
        .gte('created_at', todayStart.toISOString()),
      supabase
        .from('webhook_events')
        .select('id', { count: 'exact', head: true })
        .eq('processed', true)
        .gte('created_at', todayStart.toISOString()),
      supabase
        .from('webhook_events')
        .select('id', { count: 'exact', head: true })
        .eq('processed', true)
        .gte('created_at', yesterdayStart.toISOString())
        .lt('created_at', todayStart.toISOString()),
      supabase
        .from('dead_letter_events')
        .select('id', { count: 'exact', head: true }),
      supabase
        .from('webhook_events')
        .select('created_at, processed_at')
        .eq('processed', true)
        .not('processed_at', 'is', null)
        .gte('created_at', todayStart.toISOString())
        .limit(100),
    ])

    const totalToday = totalTodayResult.count ?? 0
    const processedToday = processedTodayResult.count ?? 0
    const processedYesterday = processedYesterdayResult.count ?? 0
    const deadLetterDepth = deadLetterResult.count ?? 0

    const successRate = totalToday > 0 ? Math.round((processedToday / totalToday) * 100) : 100

    let avgLatencyMs = 0
    const latencyRows = latencyResult.data ?? []
    if (latencyRows.length > 0) {
      const totalMs = latencyRows.reduce((sum, row) => {
        if (!row.processed_at) return sum
        return sum + (new Date(row.processed_at).getTime() - new Date(row.created_at).getTime())
      }, 0)
      avgLatencyMs = Math.round(totalMs / latencyRows.length)
    }

    return {
      data: {
        successRate,
        eventsToday: processedToday,
        eventsYesterday: processedYesterday,
        avgLatencyMs,
        deadLetterDepth,
      },
      error: null,
    }
  } catch (err) {
    logger.error('Unexpected error fetching webhook metrics', {
      source: 'admin',
      data: { error: err },
    })
    return {
      data: null,
      error: { code: 'SERVER_ERROR', message: 'Failed to load webhook metrics' },
    }
  }
}

/**
 * Returns rate limit status for Jira and GitHub.
 * Reads metadata stored in system_health by the API clients.
 * Admin-only.
 */
export async function getRateLimitStatus(): Promise<ApiResponse<RateLimitStatus>> {
  try {
    await requireAuth('admin')

    const supabase = createAdminClient()
    const { data: healthRows } = await supabase
      .from('system_health')
      .select('source, metadata, updated_at')
      .in('source', ['jira', 'github'])

    const healthMap = new Map((healthRows ?? []).map((row) => [row.source, row]))

    const jiraMeta = (healthMap.get('jira')?.metadata ?? {}) as Record<string, unknown>
    const githubMeta = (healthMap.get('github')?.metadata ?? {}) as Record<string, unknown>

    const JIRA_CALLS_PER_MINUTE = 5
    const GITHUB_REQUESTS_PER_HOUR = 5000

    const jiraUsed =
      typeof jiraMeta.rateLimitUsed === 'number' ? jiraMeta.rateLimitUsed : 0
    const githubRemaining =
      typeof githubMeta.rateLimitRemaining === 'number' ? githubMeta.rateLimitRemaining : null
    const githubUsed =
      githubRemaining !== null ? GITHUB_REQUESTS_PER_HOUR - githubRemaining : 0

    return {
      data: {
        jira: {
          callsPerMinute: JIRA_CALLS_PER_MINUTE,
          limit: JIRA_CALLS_PER_MINUTE,
          remaining:
            typeof jiraMeta.rateLimitRemaining === 'number' ? jiraMeta.rateLimitRemaining : null,
          last429At: typeof jiraMeta.last429At === 'string' ? jiraMeta.last429At : null,
          resetAt: typeof jiraMeta.retryAfter === 'string' ? jiraMeta.retryAfter : null,
        },
        github: {
          requestsPerHour: GITHUB_REQUESTS_PER_HOUR,
          limit: GITHUB_REQUESTS_PER_HOUR,
          remaining: githubRemaining,
          last429At: typeof githubMeta.last429At === 'string' ? githubMeta.last429At : null,
          resetAt: typeof githubMeta.rateLimitReset === 'string' ? githubMeta.rateLimitReset : null,
        },
        jiraUsedPercent: Math.min(100, Math.round((jiraUsed / JIRA_CALLS_PER_MINUTE) * 100)),
        githubUsedPercent:
          githubRemaining !== null
            ? Math.min(100, Math.round((githubUsed / GITHUB_REQUESTS_PER_HOUR) * 100))
            : 0,
      },
      error: null,
    }
  } catch (err) {
    logger.error('Unexpected error fetching rate limit status', {
      source: 'admin',
      data: { error: err },
    })
    return {
      data: null,
      error: { code: 'SERVER_ERROR', message: 'Failed to load rate limit status' },
    }
  }
}

// ── Retry pipeline helpers ─────────────────────────────────────────────────────

/** Simplified Jira event reprocessing — parses payload and upserts jira_issues. */
async function processJiraEvent(
  supabase: ReturnType<typeof createAdminClient>,
  event: DeadLetterEvent
): Promise<void> {
  const payload = event.payload as Record<string, unknown>
  const eventType = event.eventType

  if (
    eventType !== 'jira:issue_created' &&
    eventType !== 'jira:issue_updated'
  ) {
    // Non-issue events: acknowledge without DB changes
    return
  }

  const issue = payload.issue as Record<string, unknown> | undefined
  if (!issue) return

  const issueKey = typeof issue.key === 'string' ? issue.key : null
  if (!issueKey) throw new Error('Missing issue.key in Jira payload')

  const fields = (issue.fields ?? {}) as Record<string, unknown>
  const projectKey = issueKey.split('-')[0]

  const { data: projectRow, error: projectError } = await supabase
    .from('jira_projects')
    .select('id')
    .eq('project_key', projectKey)
    .maybeSingle()

  if (projectError) throw new Error(`Project lookup failed: ${projectError.message}`)
  if (!projectRow) throw new Error(`Jira project not found: ${projectKey}`)

  const status = (fields.status as { name?: string } | null)?.name ?? 'Unknown'
  const issueType = (fields.issuetype as { name?: string } | null)?.name ?? 'Unknown'

  const { error: upsertError } = await supabase
    .from('jira_issues')
    .upsert(
      {
        issue_key: issueKey,
        jira_project_id: projectRow.id,
        summary: typeof fields.summary === 'string' ? fields.summary : '',
        issue_type: issueType,
        status,
        priority: (fields.priority as { name?: string } | null)?.name ?? null,
        assignee_email:
          (fields.assignee as { emailAddress?: string } | null)?.emailAddress ?? null,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        raw_payload: fields as any,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'issue_key' }
    )

  if (upsertError) throw new Error(`Jira issue upsert failed: ${upsertError.message}`)
}

/** Simplified GitHub event reprocessing — upserts github_pull_requests for PR events. */
async function processGithubEvent(
  supabase: ReturnType<typeof createAdminClient>,
  event: DeadLetterEvent
): Promise<void> {
  const payload = event.payload as Record<string, unknown>
  const eventType = event.eventType

  if (eventType !== 'pull_request') {
    // Non-PR events: acknowledge without DB changes
    return
  }

  const pr = payload.pull_request as Record<string, unknown> | undefined
  const repository = payload.repository as Record<string, unknown> | undefined

  if (!pr || !repository) return

  const prNumber = typeof pr.number === 'number' ? pr.number : null
  const repoFullName = typeof repository.full_name === 'string' ? repository.full_name : null

  if (!prNumber || !repoFullName) throw new Error('Missing PR number or repo full_name in GitHub payload')

  const { data: repoRow, error: repoError } = await supabase
    .from('github_repos')
    .select('id')
    .eq('full_name', repoFullName)
    .maybeSingle()

  if (repoError) throw new Error(`Repo lookup failed: ${repoError.message}`)
  if (!repoRow) throw new Error(`GitHub repo not found: ${repoFullName}`)

  const head = (pr.head ?? {}) as Record<string, unknown>
  const base = (pr.base ?? {}) as Record<string, unknown>
  const user = (pr.user ?? {}) as Record<string, unknown>

  const { error: upsertError } = await supabase
    .from('github_pull_requests')
    .upsert(
      {
        pr_number: prNumber,
        github_repo_id: repoRow.id,
        title: typeof pr.title === 'string' ? pr.title : '',
        state: typeof pr.state === 'string' ? pr.state : 'open',
        author: typeof user.login === 'string' ? user.login : null,
        head_branch: typeof head.ref === 'string' ? head.ref : null,
        base_branch: typeof base.ref === 'string' ? base.ref : null,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        raw_payload: payload as any,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'github_repo_id,pr_number' }
    )

  if (upsertError) throw new Error(`PR upsert failed: ${upsertError.message}`)
}

// ── Retry Actions ─────────────────────────────────────────────────────────────

/**
 * Retries a single dead letter event through the webhook pipeline.
 * Pipeline: parse payload → Supabase upsert → revalidateTag → Realtime broadcast
 * HMAC validation is skipped (admin-trusted action).
 * On success, the event is deleted from dead_letter_events.
 * On failure, retry_count is incremented and the error is appended.
 * Admin-only.
 */
export async function retryDeadLetterEvent(
  input: RetryEventInput
): Promise<ApiResponse<{ retried: boolean; eventId: string }>> {
  try {
    await requireAuth('admin')

    const validation = retryEventSchema.safeParse(input)
    if (!validation.success) {
      return {
        data: null,
        error: {
          code: 'VALIDATION_ERROR',
          message: validation.error.errors[0]?.message ?? 'Invalid input',
        },
      }
    }

    const { eventId } = validation.data
    const supabase = createAdminClient()

    // Fetch the event
    const { data: row, error: fetchError } = await supabase
      .from('dead_letter_events')
      .select(
        'id, source, event_type, event_id, payload, error, retry_count, last_retry_at, correlation_id, created_at'
      )
      .eq('id', eventId)
      .single()

    if (fetchError || !row) {
      return {
        data: null,
        error: { code: 'NOT_FOUND', message: 'Dead letter event not found' },
      }
    }

    const event = mapDeadLetterRow(row)

    // Attempt pipeline execution
    let retryError: string | null = null
    try {
      if (event.source === 'jira') {
        await processJiraEvent(supabase, event)
      } else if (event.source === 'github') {
        await processGithubEvent(supabase, event)
      } else {
        throw new Error(`Unsupported event source: ${event.source}`)
      }

      // Invalidate relevant caches
      revalidateTag('issues', 'max')
      revalidateTag('github-ci', 'max')

      // Broadcast to all role channels
      const roles = ['admin', 'developer', 'qa', 'stakeholder'] as const
      await Promise.allSettled(
        roles.map((role) =>
          supabase.channel(`dashboard:${role}`).send({
            type: 'broadcast',
            event: 'webhook:retry',
            payload: { source: event.source, eventType: event.eventType, correlationId: event.correlationId },
          })
        )
      )

      // Success: remove from dead letter queue
      await supabase.from('dead_letter_events').delete().eq('id', eventId)
    } catch (err) {
      retryError = err instanceof Error ? err.message : String(err)
    }

    if (retryError) {
      // Append error to retry history without overwriting the original
      await supabase
        .from('dead_letter_events')
        .update({
          retry_count: event.retryCount + 1,
          last_retry_at: new Date().toISOString(),
          error: `${event.error}\n[Retry ${event.retryCount + 1} — ${new Date().toISOString()}]: ${retryError}`,
          updated_at: new Date().toISOString(),
        })
        .eq('id', eventId)

      logger.warn('Dead letter event retry failed', {
        source: 'admin',
        data: { eventId, retryError, retryCount: event.retryCount + 1 },
      })

      return {
        data: null,
        error: { code: 'RETRY_FAILED', message: retryError },
      }
    }

    logger.info('Dead letter event retried successfully', {
      source: 'admin',
      data: { eventId, source: event.source, eventType: event.eventType },
    })

    return { data: { retried: true, eventId }, error: null }
  } catch (err) {
    logger.error('Unexpected error retrying dead letter event', {
      source: 'admin',
      data: { error: err },
    })
    return {
      data: null,
      error: { code: 'SERVER_ERROR', message: 'Failed to retry event' },
    }
  }
}

/**
 * Retries all pending dead letter events (retryCount === 0).
 * Returns a summary of attempted, succeeded, and failed counts.
 * Admin-only.
 */
export async function bulkRetryDeadLetterEvents(): Promise<
  ApiResponse<{ attempted: number; succeeded: number; failed: number }>
> {
  try {
    await requireAuth('admin')

    const supabase = createAdminClient()
    const { data: pendingRows, error: fetchError } = await supabase
      .from('dead_letter_events')
      .select(
        'id, source, event_type, event_id, payload, error, retry_count, last_retry_at, correlation_id, created_at'
      )
      .eq('retry_count', 0)
      .order('created_at', { ascending: true })
      .limit(50) // Cap bulk retries to prevent runaway processing

    if (fetchError) {
      return {
        data: null,
        error: { code: 'DB_ERROR', message: 'Failed to fetch pending events' },
      }
    }

    const events = (pendingRows ?? []).map(mapDeadLetterRow)
    let succeeded = 0
    let failed = 0

    for (const event of events) {
      const result = await retryDeadLetterEvent({ eventId: event.id })
      if (result.error) {
        failed++
      } else {
        succeeded++
      }
    }

    logger.info('Bulk retry completed', {
      source: 'admin',
      data: { attempted: events.length, succeeded, failed },
    })

    return {
      data: { attempted: events.length, succeeded, failed },
      error: null,
    }
  } catch (err) {
    logger.error('Unexpected error during bulk retry', {
      source: 'admin',
      data: { error: err },
    })
    return {
      data: null,
      error: { code: 'SERVER_ERROR', message: 'Bulk retry failed' },
    }
  }
}
