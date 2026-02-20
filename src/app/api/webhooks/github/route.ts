import { NextRequest, NextResponse } from 'next/server'
import { revalidateTag } from 'next/cache'
import { createHmac, timingSafeEqual } from 'crypto'
import { createAdminClient } from '@/lib/supabase/admin'
import { logger } from '@/lib/logger'
import {
  githubWebhookEventSchema,
  githubPushPayloadSchema,
  githubPrPayloadSchema,
  githubWorkflowRunPayloadSchema,
} from '@/lib/schemas/github-webhook-schema'
import { sendAdminNotification } from '@/modules/notifications/lib/send-notification'
import type { Json } from '@/types/database'

const SOURCE = 'webhook:github' as const

/** Supported GitHub webhook event types */
const SUPPORTED_EVENTS = ['push', 'pull_request', 'workflow_run'] as const
type SupportedEvent = (typeof SUPPORTED_EVENTS)[number]

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
    source: 'github',
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
 * POST /api/webhooks/github
 *
 * GitHub webhook receiver — processes push, pull_request, workflow_run events.
 * Pipeline: HMAC validate → dedup → Zod parse → Supabase upsert →
 *   revalidateTag → Realtime broadcast → 200 OK
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  const correlationId = crypto.randomUUID()
  let rawBody: string
  let parsedBody: unknown
  const eventType = request.headers.get('x-github-event') ?? 'unknown'
  let eventId: string | null = request.headers.get('x-github-delivery')

  // ─── Step 0: Read raw body ─────────────────────────────────────────────────
  try {
    rawBody = await request.text()
    parsedBody = JSON.parse(rawBody)
  } catch {
    logger.error('Failed to read GitHub webhook body', { source: SOURCE, correlationId })
    return NextResponse.json(
      { data: null, error: { code: 'INVALID_BODY', message: 'Invalid request body' } },
      { status: 400 }
    )
  }

  logger.info('GitHub webhook received', {
    source: SOURCE,
    correlationId,
    data: { eventType, eventId },
  })

  const supabase = createAdminClient()

  // ─── Step 1: HMAC-SHA256 Validation ────────────────────────────────────────
  const webhookSecret = process.env.GITHUB_WEBHOOK_SECRET
  if (webhookSecret) {
    const signature = request.headers.get('x-hub-signature-256')
    if (!signature) {
      logger.warn('Missing GitHub webhook signature', { source: SOURCE, correlationId })
      return NextResponse.json(
        { data: null, error: { code: 'UNAUTHORIZED', message: 'Missing signature' } },
        { status: 401 }
      )
    }

    const expected = `sha256=${createHmac('sha256', webhookSecret).update(rawBody).digest('hex')}`
    const sigBuf = Buffer.from(signature)
    const expBuf = Buffer.from(expected)

    if (sigBuf.length !== expBuf.length || !timingSafeEqual(sigBuf, expBuf)) {
      logger.warn('Invalid GitHub webhook signature', { source: SOURCE, correlationId })
      return NextResponse.json(
        { data: null, error: { code: 'UNAUTHORIZED', message: 'Invalid signature' } },
        { status: 401 }
      )
    }
  }

  // ─── Step 2: Check for unsupported event types ─────────────────────────────
  if (eventType !== 'unknown' && !SUPPORTED_EVENTS.includes(eventType as SupportedEvent)) {
    logger.info('Unsupported GitHub event type, acknowledging', {
      source: SOURCE,
      correlationId,
      data: { eventType },
    })
    return NextResponse.json(
      { data: { status: 'acknowledged', eventType }, error: null },
      { status: 200 }
    )
  }

  // ─── Step 3: Event ID Deduplication ────────────────────────────────────────
  // X-GitHub-Delivery is the unique delivery ID from GitHub
  if (eventId) {
    const { data: existing } = await supabase
      .from('webhook_events')
      .select('id')
      .eq('event_id', eventId)
      .maybeSingle()

    if (existing) {
      logger.info('Duplicate GitHub event, skipping', {
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

  // Insert webhook event record for dedup
  const { error: insertError } = await supabase.from('webhook_events').insert({
    source: 'github',
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

  // ─── Step 4: Zod Parse by event type ───────────────────────────────────────
  // Validate the top-level envelope first
  const envelopeResult = githubWebhookEventSchema.safeParse(parsedBody)
  if (!envelopeResult.success) {
    logger.error('GitHub webhook envelope validation failed', {
      source: SOURCE,
      correlationId,
      data: { eventType, errors: envelopeResult.error.issues },
    })
    await writeDeadLetter(supabase, {
      correlationId,
      eventId,
      eventType,
      payload: parsedBody,
      error: envelopeResult.error,
    })
    void sendAdminNotification({
      type: 'webhook_failure',
      title: 'GitHub webhook processing failed',
      message: `${eventType} — payload validation failed`,
      actionUrl: '/admin/system-health',
    })
    return NextResponse.json(
      { data: null, error: { code: 'INVALID_PAYLOAD', message: 'Payload validation failed' } },
      { status: 400 }
    )
  }

  const repoFullName = envelopeResult.data.repository?.full_name ?? null
  if (!eventId && repoFullName) {
    eventId = `${eventType}:${repoFullName}:${Date.now()}`
  }

  // ─── Step 5: Supabase Upsert by event type ─────────────────────────────────
  try {
    if (eventType === 'pull_request') {
      const prResult = githubPrPayloadSchema.safeParse(parsedBody)
      if (!prResult.success) {
        await writeDeadLetter(supabase, {
          correlationId,
          eventId,
          eventType,
          payload: parsedBody,
          error: prResult.error,
        })
        return NextResponse.json(
          { data: null, error: { code: 'INVALID_PR_PAYLOAD', message: 'PR payload validation failed' } },
          { status: 400 }
        )
      }

      const { pull_request: pr, repository } = prResult.data

      if (repository) {
        // Find repo record by full_name (unique key in github_repos)
        const { data: repoRow } = await supabase
          .from('github_repos')
          .select('id')
          .eq('full_name', repository.full_name)
          .maybeSingle()

        if (repoRow) {
          const { error: upsertError } = await supabase
            .from('github_pull_requests')
            .upsert(
              {
                pr_number: pr.number,
                github_repo_id: repoRow.id,
                title: pr.title,
                state: pr.state,
                author: pr.user.login ?? null,
                head_branch: pr.head.ref,
                base_branch: pr.base.ref,
                raw_payload: pr as unknown as Json,
                updated_at: new Date().toISOString(),
              },
              { onConflict: 'github_repo_id,pr_number' }
            )

          if (upsertError) {
            throw new Error(`PR upsert failed: ${upsertError.message}`)
          }
        }
      }
    } else if (eventType === 'push') {
      // Validate push payload schema
      const pushResult = githubPushPayloadSchema.safeParse(parsedBody)
      if (!pushResult.success) {
        await writeDeadLetter(supabase, {
          correlationId,
          eventId,
          eventType,
          payload: parsedBody,
          error: pushResult.error,
        })
        return NextResponse.json(
          { data: null, error: { code: 'INVALID_PUSH_PAYLOAD', message: 'Push payload validation failed' } },
          { status: 400 }
        )
      }
      // Push events update open_issues_count via webhook; no PR record needed
    } else if (eventType === 'workflow_run') {
      const workflowResult = githubWorkflowRunPayloadSchema.safeParse(parsedBody)
      if (!workflowResult.success) {
        await writeDeadLetter(supabase, {
          correlationId,
          eventId,
          eventType,
          payload: parsedBody,
          error: workflowResult.error,
        })
        return NextResponse.json(
          { data: null, error: { code: 'INVALID_WORKFLOW_PAYLOAD', message: 'Workflow run payload validation failed' } },
          { status: 400 }
        )
      }
      // Workflow run events stored in dead_letter-safe manner; CI status widget reads from Supabase
    }

    // Mark event as processed
    await supabase
      .from('webhook_events')
      .update({ processed: true, processed_at: new Date().toISOString() })
      .eq('correlation_id', correlationId)

  } catch (err) {
    logger.error('GitHub webhook pipeline upsert failed', {
      source: SOURCE,
      correlationId,
      data: {
        eventId,
        eventType,
        step: 'upsert',
        error: err instanceof Error ? err.message : String(err),
      },
    })
    await writeDeadLetter(supabase, {
      correlationId,
      eventId,
      eventType,
      payload: parsedBody,
      error: err,
    })
    void sendAdminNotification({
      type: 'webhook_failure',
      title: 'GitHub webhook processing failed',
      message: `${eventType} — ${err instanceof Error ? err.message : 'processing error'}`,
      actionUrl: '/admin/system-health',
    })
    return NextResponse.json(
      { data: null, error: { code: 'PROCESSING_ERROR', message: 'Failed to process GitHub webhook' } },
      { status: 500 }
    )
  }

  // ─── Step 6: ISR Cache Invalidation ────────────────────────────────────────
  if (eventType === 'pull_request') {
    revalidateTag('github-prs')
  } else if (eventType === 'workflow_run') {
    revalidateTag('github-ci')
  }

  // ─── Step 7: Realtime Broadcast ─────────────────────────────────────────────
  try {
    const roles = ['admin', 'developer', 'qa', 'stakeholder'] as const
    await Promise.all(
      roles.map((role) =>
        supabase.channel(`dashboard:${role}`).send({
          type: 'broadcast',
          event: 'webhook:github',
          payload: { eventType, eventId, correlationId },
        })
      )
    )
  } catch (broadcastErr) {
    logger.warn('GitHub Realtime broadcast failed', {
      source: SOURCE,
      correlationId,
      data: { error: broadcastErr instanceof Error ? broadcastErr.message : String(broadcastErr) },
    })
  }

  // ─── Step 8: 200 OK ────────────────────────────────────────────────────────
  logger.info('GitHub webhook processed successfully', {
    source: SOURCE,
    correlationId,
    data: { eventType, eventId },
  })

  return NextResponse.json(
    { data: { status: 'processed', correlationId, eventId }, error: null },
    { status: 200 }
  )
}
