import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { logger } from '@/lib/logger'

const SOURCE = 'webhook:jira' as const

interface JiraWebhookResponse {
  self: string
  webhookRegistrationResult?: Array<{
    createdWebhookId: number
    errors?: string[]
  }>
}

interface ExistingWebhook {
  id: number
  url: string
  events: string[]
  expirationDate?: number
}

/**
 * GET /api/cron/refresh-webhooks
 *
 * Secured cron job — re-registers Jira webhook subscriptions on a 25-day cycle.
 * Must be called with the `Authorization: Bearer {CRON_SECRET}` header.
 *
 * Pipeline:
 * 1. Validate CRON_SECRET
 * 2. List existing Jira webhooks → delete matching ones
 * 3. Register new webhook for all relevant events
 * 4. Log result + update system_health
 * 5. Write dead_letter on failure
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  const correlationId = crypto.randomUUID()

  // ─── Step 1: Authenticate the cron caller ──────────────────────────────────
  const cronSecret = process.env.CRON_SECRET
  if (!cronSecret) {
    logger.error('CRON_SECRET not configured', { source: SOURCE, correlationId })
    return NextResponse.json(
      { data: null, error: { code: 'CONFIG_ERROR', message: 'CRON_SECRET not set' } },
      { status: 500 }
    )
  }

  const authHeader = request.headers.get('authorization')
  if (!authHeader || authHeader !== `Bearer ${cronSecret}`) {
    logger.warn('Unauthorized cron request', { source: SOURCE, correlationId })
    return NextResponse.json(
      { data: null, error: { code: 'UNAUTHORIZED', message: 'Invalid cron secret' } },
      { status: 401 }
    )
  }

  // ─── Step 2: Validate Jira credentials ─────────────────────────────────────
  const jiraBaseUrl = process.env.JIRA_BASE_URL
  const jiraEmail = process.env.JIRA_EMAIL
  const jiraApiToken = process.env.JIRA_API_TOKEN
  const appBaseUrl = process.env.NEXTAUTH_URL ?? process.env.VERCEL_URL
  const jiraWebhookSecret = process.env.JIRA_WEBHOOK_SECRET

  if (!jiraBaseUrl || !jiraEmail || !jiraApiToken || !appBaseUrl) {
    logger.error('Jira credentials incomplete', { source: SOURCE, correlationId })
    return NextResponse.json(
      { data: null, error: { code: 'CONFIG_ERROR', message: 'Jira credentials not fully configured' } },
      { status: 500 }
    )
  }

  const webhookCallbackUrl = `${appBaseUrl.replace(/\/$/, '')}/api/webhooks/jira`
  const basicAuth = Buffer.from(`${jiraEmail}:${jiraApiToken}`).toString('base64')
  const headers = {
    Authorization: `Basic ${basicAuth}`,
    'Content-Type': 'application/json',
    Accept: 'application/json',
  }

  const supabase = createAdminClient()
  let newWebhookId: number | null = null

  try {
    // ─── Step 3: List and delete existing webhooks for this callback URL ──────
    const listRes = await fetch(`${jiraBaseUrl}/rest/webhooks/1.0/webhook`, {
      headers,
    })

    if (listRes.ok) {
      const existingWebhooks = (await listRes.json()) as ExistingWebhook[]
      const stale = existingWebhooks.filter((wh) => wh.url === webhookCallbackUrl)

      for (const wh of stale) {
        const deleteRes = await fetch(`${jiraBaseUrl}/rest/webhooks/1.0/webhook/${wh.id}`, {
          method: 'DELETE',
          headers,
        })
        if (deleteRes.ok || deleteRes.status === 204) {
          logger.info('Deleted stale Jira webhook', {
            source: SOURCE,
            correlationId,
            data: { webhookId: wh.id },
          })
        }
      }
    }

    // ─── Step 4: Register a new webhook ───────────────────────────────────────
    const webhookPayload = {
      url: webhookCallbackUrl,
      ...(jiraWebhookSecret && { secret: jiraWebhookSecret }),
      webhooks: [
        {
          events: [
            'jira:issue_created',
            'jira:issue_updated',
            'jira:issue_deleted',
            'sprint_created',
            'sprint_updated',
            'sprint_started',
            'sprint_closed',
          ],
          jqlFilter: '',
        },
      ],
    }

    const registerRes = await fetch(`${jiraBaseUrl}/rest/webhooks/1.0/webhook`, {
      method: 'POST',
      headers,
      body: JSON.stringify(webhookPayload),
    })

    if (!registerRes.ok) {
      const errorBody = await registerRes.text()
      throw new Error(`Webhook registration failed: ${registerRes.status} ${errorBody}`)
    }

    const registrationResult = (await registerRes.json()) as JiraWebhookResponse
    const created = registrationResult.webhookRegistrationResult?.[0]
    newWebhookId = created?.createdWebhookId ?? null

    const expiryDate = new Date()
    expiryDate.setDate(expiryDate.getDate() + 30)

    logger.info('Jira webhook refreshed successfully', {
      source: SOURCE,
      correlationId,
      data: {
        webhookId: newWebhookId,
        expiryDate: expiryDate.toISOString(),
        callbackUrl: webhookCallbackUrl,
      },
    })

    // ─── Step 5: Record health status ────────────────────────────────────────
    await supabase.from('system_health').insert({
      service: 'jira:webhook',
      status: 'healthy',
      checked_at: new Date().toISOString(),
    })

    return NextResponse.json(
      {
        data: {
          status: 'refreshed',
          webhookId: newWebhookId,
          expiryDate: expiryDate.toISOString(),
          callbackUrl: webhookCallbackUrl,
        },
        error: null,
      },
      { status: 200 }
    )
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : String(err)

    logger.error('Webhook refresh failed', {
      source: SOURCE,
      correlationId,
      data: { error: errorMessage },
    })

    // Write failure to dead_letter_events
    await supabase.from('dead_letter_events').insert({
      source: 'jira',
      event_type: 'webhook:refresh',
      event_id: null,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      payload: { correlationId, callbackUrl: webhookCallbackUrl } as any,
      error: errorMessage,
      correlation_id: correlationId,
    })

    // Record health failure
    await supabase.from('system_health').insert({
      service: 'jira:webhook',
      status: 'degraded',
      checked_at: new Date().toISOString(),
    })

    return NextResponse.json(
      {
        data: null,
        error: { code: 'REFRESH_FAILED', message: 'Webhook refresh failed — existing webhook remains active until expiry' },
      },
      { status: 500 }
    )
  }
}
