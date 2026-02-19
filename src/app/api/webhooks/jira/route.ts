import { NextRequest, NextResponse } from 'next/server'
import { revalidateTag } from 'next/cache'
import { createHmac, timingSafeEqual } from 'crypto'
import { createAdminClient } from '@/lib/supabase/admin'
import { logger } from '@/lib/logger'
import {
  jiraWebhookEventSchema,
  jiraIssuePayloadSchema,
} from '@/lib/schemas/jira-webhook-schema'
import { sendAdminNotification } from '@/modules/notifications/lib/send-notification'

const SOURCE = 'webhook:jira' as const

/** Exponential backoff delays per retry attempt: 1s, 5s, 30s */
const RETRY_DELAYS_MS = [1000, 5000, 30000] as const

/**
 * Retries an async operation with exponential backoff.
 * On all retries exhausted, throws the last error.
 */
async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries = 3
): Promise<T> {
  let lastError: unknown
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn()
    } catch (err) {
      lastError = err
      if (attempt < maxRetries) {
        const delayMs = RETRY_DELAYS_MS[attempt] ?? 1000
        await new Promise((resolve) => setTimeout(resolve, delayMs))
      }
    }
  }
  throw lastError
}

/**
 * Writes an event to the dead_letter_events table for manual investigation.
 * Best-effort — if this write fails, we log but do not throw.
 */
async function writeDeadLetter(
  supabase: ReturnType<typeof createAdminClient>,
  params: {
    correlationId: string
    eventId: string | null
    eventType: string
    payload: unknown
    error: unknown
    retryCount?: number
  }
): Promise<void> {
  const errorMessage =
    params.error instanceof Error
      ? params.error.message
      : JSON.stringify(params.error)

  const { error: dbError } = await supabase.from('dead_letter_events').insert({
    source: 'jira',
    event_type: params.eventType,
    event_id: params.eventId,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    payload: params.payload as any,
    error: errorMessage,
    retry_count: params.retryCount ?? 0,
    correlation_id: params.correlationId,
  })

  if (dbError) {
    logger.error('Failed to write to dead_letter_events', {
      source: SOURCE,
      correlationId: params.correlationId,
      data: { dbError: dbError.message },
    })
  }
}

/**
 * POST /api/webhooks/jira
 *
 * Jira webhook receiver — processes events in the following pipeline:
 * 1. HMAC-SHA256 validate → 401 if invalid
 * 2. Event ID dedup → 200 if already processed
 * 3. Out-of-order check → 200 if newer event already processed (Story 4.3)
 * 4. Zod parse → 400 + dead_letter if invalid
 * 5. Supabase upsert with retry backoff (1s/5s/30s, max 3) → dead_letter if exhausted
 * 6. revalidateTag('issues') → ISR cache invalidation
 * 7. Realtime broadcast → dashboard:{role} channel
 * 8. Return 200 OK
 *
 * Burst tolerance: each invocation is independent serverless execution.
 * On overflow/failure, events go to dead_letter rather than being dropped silently.
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  const correlationId = crypto.randomUUID()
  let rawBody: string
  let parsedBody: unknown
  let eventType = 'unknown'
  let eventId: string | null = null

  // ─── Step 0: Read raw body for HMAC verification ───────────────────────────
  try {
    rawBody = await request.text()
    parsedBody = JSON.parse(rawBody)
  } catch {
    logger.error('Failed to read request body', { source: SOURCE, correlationId })
    return NextResponse.json(
      { data: null, error: { code: 'INVALID_BODY', message: 'Invalid request body' } },
      { status: 400 }
    )
  }

  // Extract basic fields for logging context
  if (parsedBody && typeof parsedBody === 'object') {
    const body = parsedBody as Record<string, unknown>
    eventType = typeof body.webhookEvent === 'string' ? body.webhookEvent : 'unknown'
    eventId =
      typeof body.issue === 'object' && body.issue !== null
        ? `${eventType}:${(body.issue as Record<string, unknown>).key ?? ''}`
        : `${eventType}:${correlationId}`
  }

  logger.info('Jira webhook received', {
    source: SOURCE,
    correlationId,
    data: { eventType },
  })

  const supabase = createAdminClient()

  // ─── Step 1: HMAC-SHA256 Validation ────────────────────────────────────────
  const webhookSecret = process.env.JIRA_WEBHOOK_SECRET
  if (webhookSecret) {
    const signature = request.headers.get('x-hub-signature-256')
    if (!signature) {
      logger.warn('Missing webhook signature', { source: SOURCE, correlationId })
      return NextResponse.json(
        { data: null, error: { code: 'UNAUTHORIZED', message: 'Missing signature' } },
        { status: 401 }
      )
    }

    const expected = `sha256=${createHmac('sha256', webhookSecret).update(rawBody).digest('hex')}`
    const signatureBuffer = Buffer.from(signature)
    const expectedBuffer = Buffer.from(expected)

    if (
      signatureBuffer.length !== expectedBuffer.length ||
      !timingSafeEqual(signatureBuffer, expectedBuffer)
    ) {
      logger.warn('Invalid webhook signature', { source: SOURCE, correlationId })
      return NextResponse.json(
        { data: null, error: { code: 'UNAUTHORIZED', message: 'Invalid signature' } },
        { status: 401 }
      )
    }
  }

  // ─── Step 2: Event ID Deduplication ────────────────────────────────────────
  if (eventId) {
    const { data: existing, error: dedupError } = await supabase
      .from('webhook_events')
      .select('id')
      .eq('event_id', eventId)
      .maybeSingle()

    if (dedupError) {
      logger.error('Dedup query failed', {
        source: SOURCE,
        correlationId,
        data: { error: dedupError.message },
      })
    } else if (existing) {
      logger.info('Duplicate event, skipping', {
        source: SOURCE,
        correlationId,
        data: { eventId },
      })
      return NextResponse.json(
        { data: { status: 'duplicate', eventId }, error: null },
        { status: 200 }
      )
    }
  }

  // Insert event record before further processing (idempotency guard)
  const { error: insertError } = await supabase.from('webhook_events').insert({
    source: 'jira',
    event_type: eventType,
    event_id: eventId ?? correlationId,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    payload: parsedBody as any,
    processed: false,
    correlation_id: correlationId,
  })

  if (insertError) {
    logger.warn('Failed to insert webhook_event record', {
      source: SOURCE,
      correlationId,
      data: { error: insertError.message },
    })
  }

  // ─── Step 3: Zod Parse ─────────────────────────────────────────────────────
  const parseResult = jiraWebhookEventSchema.safeParse(parsedBody)

  if (!parseResult.success) {
    logger.error('Webhook payload failed Zod validation', {
      source: SOURCE,
      correlationId,
      data: { eventId, errors: parseResult.error.issues },
    })
    await writeDeadLetter(supabase, {
      correlationId,
      eventId,
      eventType,
      payload: parsedBody,
      error: parseResult.error,
    })
    void sendAdminNotification({
      type: 'webhook_failure',
      title: 'Jira webhook processing failed',
      message: `${eventType} — payload validation failed`,
      actionUrl: '/admin/system-health',
    })
    return NextResponse.json(
      { data: null, error: { code: 'INVALID_PAYLOAD', message: 'Payload validation failed' } },
      { status: 400 }
    )
  }

  const webhookEvent = parseResult.data

  // ─── Step 3b: Out-of-order check (Story 4.3) ───────────────────────────────
  // If a newer event for the same issue has already been processed, skip this one.
  if (webhookEvent.issue) {
    const issueKey = webhookEvent.issue.key
    const eventUpdatedAt = webhookEvent.issue.fields.updated

    if (eventUpdatedAt) {
      const { data: storedIssue } = await supabase
        .from('jira_issues')
        .select('jira_updated_at')
        .eq('issue_key', issueKey)
        .maybeSingle()

      if (storedIssue?.jira_updated_at) {
        const storedTs = new Date(storedIssue.jira_updated_at).getTime()
        const eventTs = new Date(eventUpdatedAt).getTime()

        if (storedTs > eventTs) {
          logger.info('Out-of-order event skipped: newer event already processed', {
            source: SOURCE,
            correlationId,
            data: {
              issueKey,
              eventUpdatedAt,
              storedUpdatedAt: storedIssue.jira_updated_at,
              reason: 'out-of-order: newer event already processed',
            },
          })
          return NextResponse.json(
            { data: { status: 'out_of_order', eventId }, error: null },
            { status: 200 }
          )
        }
      }
    }
  }

  // ─── Step 4: Supabase Upsert with Retry ────────────────────────────────────
  let upsertAttempts = 0

  try {
    await retryWithBackoff(async () => {
      upsertAttempts++

      if (
        webhookEvent.issue &&
        (eventType === 'jira:issue_created' ||
          eventType === 'jira:issue_updated' ||
          eventType === 'jira:issue_deleted')
      ) {
        const issue = webhookEvent.issue
        const fields = issue.fields

        const projectKey = issue.key.split('-')[0]
        const { data: projectRow, error: projectError } = await supabase
          .from('jira_projects')
          .select('id')
          .eq('project_key', projectKey)
          .maybeSingle()

        if (projectError) {
          throw new Error(`Project lookup failed: ${projectError.message}`)
        }

        if (projectRow && eventType !== 'jira:issue_deleted') {
          const issuePayload = jiraIssuePayloadSchema.parse({
            issue_key: issue.key,
            summary: fields.summary,
            description: typeof fields.description === 'string' ? fields.description : null,
            issue_type: fields.issuetype.name,
            status: fields.status.name,
            priority: fields.priority?.name ?? null,
            assignee_email: fields.assignee?.emailAddress ?? null,
            reporter_email: fields.reporter?.emailAddress ?? null,
            story_points: fields.customfield_10016 ?? fields.story_points ?? null,
            labels: fields.labels ?? [],
            jira_updated_at: fields.updated ?? null,
            jira_created_at: fields.created ?? null,
          })

          const { error: upsertError } = await supabase
            .from('jira_issues')
            .upsert(
              {
                ...issuePayload,
                project_id: projectRow.id,
                synced_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              },
              { onConflict: 'issue_key' }
            )

          if (upsertError) {
            throw new Error(`Upsert failed: ${upsertError.message}`)
          }
        }
      }

      // Mark event as processed
      const { error: updateError } = await supabase
        .from('webhook_events')
        .update({ processed: true, processed_at: new Date().toISOString() })
        .eq('correlation_id', correlationId)

      if (updateError) {
        throw new Error(`Event mark-processed failed: ${updateError.message}`)
      }
    }, 3)
  } catch (err) {
    logger.error('Webhook pipeline failed after retries exhausted', {
      source: SOURCE,
      correlationId,
      data: {
        eventId,
        step: 'upsert',
        attempts: upsertAttempts,
        error: err instanceof Error ? err.message : String(err),
      },
    })
    await writeDeadLetter(supabase, {
      correlationId,
      eventId,
      eventType,
      payload: parsedBody,
      error: err,
      retryCount: upsertAttempts,
    })
    void sendAdminNotification({
      type: 'webhook_failure',
      title: 'Jira webhook processing failed',
      message: `${eventType} — failed after ${upsertAttempts} retries`,
      actionUrl: '/admin/system-health',
    })
    return NextResponse.json(
      { data: null, error: { code: 'PROCESSING_ERROR', message: 'Failed to process webhook event after retries' } },
      { status: 500 }
    )
  }

  // ─── Step 5: ISR Cache Invalidation ────────────────────────────────────────
  revalidateTag('issues')

  // ─── Step 6: Realtime Broadcast ─────────────────────────────────────────────
  try {
    const roles = ['admin', 'developer', 'qa', 'stakeholder'] as const
    await Promise.all(
      roles.map((role) =>
        supabase.channel(`dashboard:${role}`).send({
          type: 'broadcast',
          event: 'webhook:jira',
          payload: { eventType, eventId, correlationId },
        })
      )
    )
  } catch (broadcastErr) {
    logger.warn('Realtime broadcast failed', {
      source: SOURCE,
      correlationId,
      data: { error: broadcastErr instanceof Error ? broadcastErr.message : String(broadcastErr) },
    })
  }

  // ─── Step 7: 200 OK ────────────────────────────────────────────────────────
  logger.info('Jira webhook processed successfully', {
    source: SOURCE,
    correlationId,
    data: { eventType, eventId },
  })

  return NextResponse.json(
    { data: { status: 'processed', correlationId, eventId }, error: null },
    { status: 200 }
  )
}
