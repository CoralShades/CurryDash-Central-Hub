'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { requireAuth } from '@/lib/auth'
import { logger } from '@/lib/logger'
import type { ApiResponse } from '@/types/api'
import {
  testConnectionSchema,
  saveCredentialsSchema,
  type TestConnectionInput,
  type SaveCredentialsInput,
  type IntegrationType,
} from '../schemas/integration-schema'

export type IntegrationStatus = 'connected' | 'disconnected' | 'error' | 'unknown'

export interface IntegrationInfo {
  integration: IntegrationType
  name: string
  status: IntegrationStatus
  lastSyncAt: string | null
  lastWebhookAt: string | null
  errorMessage: string | null
  maskedCredentials: Record<string, string>
}

/** Masks a credential value — shows prefix and last 4 chars only */
function maskSecret(value: string): string {
  if (!value || value.length <= 8) return '•••'
  const prefix = value.slice(0, Math.min(3, value.length - 4))
  return `${prefix}...${value.slice(-4)}`
}

/** Checks if a string is set and non-empty in env */
function hasEnvVar(name: string): boolean {
  const val = process.env[name]
  return Boolean(val && val.trim().length > 0)
}

/**
 * Reads masked credential hints from env vars.
 * Never returns the raw value — only masked suffix.
 */
function getMaskedCredentials(integration: IntegrationType): Record<string, string> {
  if (integration === 'jira') {
    return {
      baseUrl: process.env.JIRA_BASE_URL ? maskSecret(process.env.JIRA_BASE_URL) : '',
      email: process.env.JIRA_EMAIL ? maskSecret(process.env.JIRA_EMAIL) : '',
      apiToken: process.env.JIRA_API_TOKEN ? maskSecret(process.env.JIRA_API_TOKEN) : '',
      webhookSecret: process.env.JIRA_WEBHOOK_SECRET
        ? maskSecret(process.env.JIRA_WEBHOOK_SECRET)
        : '',
    }
  }
  if (integration === 'github') {
    return {
      oauthToken: process.env.GITHUB_TOKEN ? maskSecret(process.env.GITHUB_TOKEN) : '',
      webhookSecret: process.env.GITHUB_WEBHOOK_SECRET
        ? maskSecret(process.env.GITHUB_WEBHOOK_SECRET)
        : '',
    }
  }
  // anthropic
  return {
    apiKey: process.env.ANTHROPIC_API_KEY ? maskSecret(process.env.ANTHROPIC_API_KEY) : '',
  }
}

/**
 * Determines initial status from env var presence.
 * Actual connectivity is only verified on testConnection().
 */
function getEnvBasedStatus(integration: IntegrationType): 'connected' | 'disconnected' {
  if (integration === 'jira') {
    return hasEnvVar('JIRA_BASE_URL') && hasEnvVar('JIRA_EMAIL') && hasEnvVar('JIRA_API_TOKEN')
      ? 'connected'
      : 'disconnected'
  }
  if (integration === 'github') {
    return hasEnvVar('GITHUB_TOKEN') ? 'connected' : 'disconnected'
  }
  // anthropic
  return hasEnvVar('ANTHROPIC_API_KEY') ? 'connected' : 'disconnected'
}

const INTEGRATION_NAMES: Record<IntegrationType, string> = {
  jira: 'Jira',
  github: 'GitHub',
  anthropic: 'Anthropic AI',
}

/**
 * Returns status for all three integrations.
 * Queries system_health table for last sync/webhook timestamps and error state.
 * Admin-only.
 */
export async function getIntegrationStatuses(): Promise<ApiResponse<IntegrationInfo[]>> {
  try {
    await requireAuth('admin')

    const supabase = createAdminClient()
    const { data: healthRows, error: dbError } = await supabase
      .from('system_health')
      .select('source, status, last_event_at, metadata, updated_at')
      .in('source', ['jira', 'github', 'anthropic'])

    if (dbError) {
      logger.error('Failed to fetch integration statuses from system_health', {
        source: 'admin',
        data: { error: dbError },
      })
    }

    const healthMap = new Map(
      (healthRows ?? []).map((row) => [row.source as IntegrationType, row])
    )

    const integrations: IntegrationType[] = ['jira', 'github', 'anthropic']

    const result: IntegrationInfo[] = integrations.map((integration) => {
      const row = healthMap.get(integration)
      const meta = (row?.metadata ?? {}) as Record<string, string>

      let status: IntegrationStatus = 'unknown'
      if (row) {
        status = (row.status as IntegrationStatus) ?? 'unknown'
      } else {
        // Fall back to env var presence check if no DB record yet
        status = getEnvBasedStatus(integration)
      }

      return {
        integration,
        name: INTEGRATION_NAMES[integration],
        status,
        lastSyncAt: (meta.lastSyncAt as string | null) ?? null,
        lastWebhookAt: row?.last_event_at ?? null,
        errorMessage: (meta.errorMessage as string | null) ?? null,
        maskedCredentials: getMaskedCredentials(integration),
      }
    })

    return { data: result, error: null }
  } catch (err) {
    logger.error('Unexpected error fetching integration statuses', {
      source: 'admin',
      data: { error: err },
    })
    return {
      data: null,
      error: { code: 'SERVER_ERROR', message: 'Failed to load integration statuses' },
    }
  }
}

/**
 * Tests connectivity for a specific integration using current credentials.
 * Makes a lightweight API call and updates system_health table.
 * Admin-only.
 */
export async function testConnection(
  input: TestConnectionInput
): Promise<ApiResponse<{ verified: boolean; message: string }>> {
  try {
    await requireAuth('admin')

    const validation = testConnectionSchema.safeParse(input)
    if (!validation.success) {
      return {
        data: null,
        error: {
          code: 'VALIDATION_ERROR',
          message: validation.error.errors[0]?.message ?? 'Validation failed',
        },
      }
    }

    const { integration } = validation.data
    let verified = false
    let message = ''
    let errorMessage: string | null = null

    if (integration === 'jira') {
      const host = process.env.JIRA_BASE_URL
      const email = process.env.JIRA_EMAIL
      const apiToken = process.env.JIRA_API_TOKEN

      if (!host || !email || !apiToken) {
        return {
          data: null,
          error: { code: 'MISSING_CREDENTIALS', message: 'Jira credentials not configured' },
        }
      }

      try {
        const credentials = Buffer.from(`${email}:${apiToken}`).toString('base64')
        const response = await fetch(`${host}/rest/api/3/myself`, {
          headers: {
            Authorization: `Basic ${credentials}`,
            Accept: 'application/json',
          },
          signal: AbortSignal.timeout(10000),
        })

        if (response.ok) {
          const userData = (await response.json()) as { displayName?: string }
          verified = true
          message = `Connected as ${userData.displayName ?? email}`
        } else {
          const status = response.status
          errorMessage =
            status === 401
              ? '401 Unauthorized — check your API token'
              : status === 403
                ? '403 Forbidden — check permissions'
                : `${status} error — check your Jira configuration`
          message = errorMessage
        }
      } catch (fetchErr) {
        errorMessage = `Connection failed: ${fetchErr instanceof Error ? fetchErr.message : 'Unknown error'}`
        message = errorMessage
      }
    } else if (integration === 'github') {
      const token = process.env.GITHUB_TOKEN

      if (!token) {
        return {
          data: null,
          error: { code: 'MISSING_CREDENTIALS', message: 'GitHub token not configured' },
        }
      }

      try {
        const response = await fetch('https://api.github.com/user', {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/vnd.github+json',
            'X-GitHub-Api-Version': '2022-11-28',
          },
          signal: AbortSignal.timeout(10000),
        })

        if (response.ok) {
          const userData = (await response.json()) as { login?: string }
          verified = true
          message = `Connected as ${userData.login ?? 'authenticated user'}`
        } else {
          const status = response.status
          errorMessage =
            status === 401
              ? '401 Unauthorized — check your GitHub token'
              : `${status} error — check your GitHub configuration`
          message = errorMessage
        }
      } catch (fetchErr) {
        errorMessage = `Connection failed: ${fetchErr instanceof Error ? fetchErr.message : 'Unknown error'}`
        message = errorMessage
      }
    } else {
      // anthropic — verify key format and optionally ping the API
      const apiKey = process.env.ANTHROPIC_API_KEY

      if (!apiKey) {
        return {
          data: null,
          error: { code: 'MISSING_CREDENTIALS', message: 'Anthropic API key not configured' },
        }
      }

      try {
        const response = await fetch('https://api.anthropic.com/v1/models', {
          headers: {
            'x-api-key': apiKey,
            'anthropic-version': '2023-06-01',
          },
          signal: AbortSignal.timeout(10000),
        })

        if (response.ok) {
          verified = true
          message = 'Anthropic API key verified'
        } else {
          const status = response.status
          errorMessage =
            status === 401
              ? '401 Unauthorized — check your Anthropic API key'
              : `${status} error — check your Anthropic configuration`
          message = errorMessage
        }
      } catch (fetchErr) {
        errorMessage = `Connection failed: ${fetchErr instanceof Error ? fetchErr.message : 'Unknown error'}`
        message = errorMessage
      }
    }

    // Update system_health with test result
    const supabase = createAdminClient()
    await supabase.from('system_health').upsert(
      {
        source: integration,
        status: verified ? 'connected' : 'error',
        metadata: errorMessage ? { errorMessage } : {},
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'source' }
    )

    logger.info('Integration connection test completed', {
      source: 'admin',
      data: { integration, verified },
    })

    return { data: { verified, message }, error: null }
  } catch (err) {
    logger.error('Unexpected error testing integration connection', {
      source: 'admin',
      data: { error: err },
    })
    return { data: null, error: { code: 'SERVER_ERROR', message: 'Failed to test connection' } }
  }
}

/**
 * Saves integration credentials to environment (placeholder — in production,
 * credentials would be stored in encrypted Supabase secrets or secret manager).
 * Updates system_health metadata with the last update timestamp.
 * Admin-only.
 */
export async function saveCredentials(
  input: SaveCredentialsInput
): Promise<ApiResponse<{ updated: boolean }>> {
  try {
    await requireAuth('admin')

    const validation = saveCredentialsSchema.safeParse(input)
    if (!validation.success) {
      return {
        data: null,
        error: {
          code: 'VALIDATION_ERROR',
          message: validation.error.errors[0]?.message ?? 'Validation failed',
        },
      }
    }

    const { integration } = validation.data

    // Record the update event in system_health metadata
    // In production: store encrypted credentials in a secret manager
    const supabase = createAdminClient()
    await supabase.from('system_health').upsert(
      {
        source: integration,
        status: 'unknown',
        metadata: { lastCredentialUpdateAt: new Date().toISOString() },
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'source' }
    )

    logger.info('Integration credentials updated', {
      source: 'admin',
      data: { integration },
    })

    return { data: { updated: true }, error: null }
  } catch (err) {
    logger.error('Unexpected error saving integration credentials', {
      source: 'admin',
      data: { error: err },
    })
    return {
      data: null,
      error: { code: 'SERVER_ERROR', message: 'Failed to save credentials' },
    }
  }
}
