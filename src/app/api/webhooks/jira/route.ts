import { NextRequest, NextResponse } from 'next/server'
import { revalidateTag } from 'next/cache'
import { createHmac, timingSafeEqual } from 'crypto'
import { createAdminClient } from '@/lib/supabase/admin'
import { logger } from '@/lib/logger'
import {
  jiraWebhookEventSchema,
  jiraIssuePayloadSchema,
} from '@/lib/schemas/jira-webhook-schema'

const SOURCE = 'webhook:jira' as const

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
 * 3. Zod parse → 400 + dead_letter if invalid
 * 4. Supabase upsert → dead_letter if fails
 * 5. revalidateTag('issues') → ISR cache invalidation
 * 6. Realtime broadcast → dashboard:{role} channel
 * 7. Return 200 OK
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
    logger.error('Failed to read request body', {
      source: SOURCE,
      correlationId,
    })
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
    // Not fatal — continue processing but log for visibility
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
    return NextResponse.json(
      { data: null, error: { code: 'INVALID_PAYLOAD', message: 'Payload validation failed' } },
      { status: 400 }
    )
  }

  const webhookEvent = parseResult.data

  // ─── Step 4: Supabase Upsert ───────────────────────────────────────────────
  try {
    // Process issue events
    if (
      webhookEvent.issue &&
      (eventType === 'jira:issue_created' ||
        eventType === 'jira:issue_updated' ||
        eventType === 'jira:issue_deleted')
    ) {
      const issue = webhookEvent.issue
      const fields = issue.fields

      // Build a lookup for the jira_projects table by issue key prefix
      const projectKey = issue.key.split('-')[0]
      const { data: projectRow } = await supabase
        .from('jira_projects')
        .select('id')
        .eq('project_key', projectKey)
        .maybeSingle()

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
    await supabase
      .from('webhook_events')
      .update({ processed: true, processed_at: new Date().toISOString() })
      .eq('correlation_id', correlationId)

  } catch (err) {
    logger.error('Webhook pipeline upsert failed', {
      source: SOURCE,
      correlationId,
      data: { eventId, step: 'upsert', error: err instanceof Error ? err.message : String(err) },
    })
    await writeDeadLetter(supabase, { correlationId, eventId, eventType, payload: parsedBody, error: err })
    return NextResponse.json(
      { data: null, error: { code: 'PROCESSING_ERROR', message: 'Failed to process webhook event' } },
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
    // Broadcast failure is non-fatal — clients poll on reconnect
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
