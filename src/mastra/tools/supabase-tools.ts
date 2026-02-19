import { createTool } from '@mastra/core'
import { z } from 'zod'
import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'
import { logger } from '@/lib/logger'
import { isSessionCapExceeded } from '@/mastra/agents/model-routing'

const MONTHLY_BUDGET_USD = 50
const BUDGET_WARN_THRESHOLD = 0.8
const SUPABASE_TIMEOUT_MS = 3_000

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

export const getAiUsageSummaryTool = createTool({
  id: 'get-ai-usage-summary',
  description:
    'Retrieves AI token usage and cost summary from the Supabase ai_usage table. Useful for admins monitoring the $50/month AI budget. Query has a 3-second timeout.',
  inputSchema: z.object({
    year: z
      .number()
      .int()
      .min(2024)
      .max(2100)
      .optional()
      .describe('Filter by year, defaults to current year'),
    month: z
      .number()
      .int()
      .min(1)
      .max(12)
      .optional()
      .describe('Filter by month (1-12), defaults to current month'),
    sessionTokens: z
      .number()
      .int()
      .min(0)
      .optional()
      .default(0)
      .describe('Cumulative session token count for budget enforcement'),
  }),
  execute: async ({ context }) => {
    const { year: yearInput, month: monthInput, sessionTokens } = context
    const correlationId = generateCorrelationId()

    // Token budget check
    if (isSessionCapExceeded(sessionTokens ?? 0)) {
      return SESSION_CAP_ERROR
    }

    const now = new Date()
    const year = yearInput ?? now.getFullYear()
    const month = monthInput ?? now.getMonth() + 1

    const startDate = new Date(year, month - 1, 1).toISOString()
    const endDate = new Date(year, month, 1).toISOString()

    const supabase = getSupabaseAdmin()

    let data:
      | { model: string; prompt_tokens: number; completion_tokens: number; total_tokens: number; estimated_cost_usd: number }[]
      | null = null
    let error: { message: string } | null = null

    try {
      const result = await withTimeout(
        (async () =>
          supabase
            .from('ai_usage')
            .select('model, prompt_tokens, completion_tokens, total_tokens, estimated_cost_usd')
            .gte('created_at', startDate)
            .lt('created_at', endDate))(),
        SUPABASE_TIMEOUT_MS
      )
      data = result.data
      error = result.error
    } catch (timeoutErr: unknown) {
      logger.error('AI usage query timed out', {
        correlationId,
        source: 'ai',
        data: { year, month, error: String(timeoutErr) },
      })
      return {
        data: null,
        error: { code: 'SUPABASE_TIMEOUT', message: "I couldn't retrieve that data — query timed out" },
      }
    }

    if (error) {
      logger.warn('Failed to fetch AI usage', {
        correlationId,
        source: 'ai',
        data: { error: error.message },
      })
      return {
        data: null,
        error: { code: 'SUPABASE_ERROR', message: `I couldn't retrieve that data — ${error.message}` },
      }
    }

    const rows = data ?? []
    const totalCost = rows.reduce((sum, r) => sum + r.estimated_cost_usd, 0)
    const totalTokens = rows.reduce((sum, r) => sum + r.total_tokens, 0)
    const requestCount = rows.length

    const budgetUsedPct = totalCost / MONTHLY_BUDGET_USD

    if (budgetUsedPct >= BUDGET_WARN_THRESHOLD) {
      logger.warn('AI monthly budget at 80%+ threshold', {
        correlationId,
        source: 'ai',
        data: {
          month: `${year}-${String(month).padStart(2, '0')}`,
          totalCostUsd: totalCost,
          budgetUsd: MONTHLY_BUDGET_USD,
          usagePercent: Math.round(budgetUsedPct * 100),
        },
      })
    }

    const byModel = rows.reduce<Record<string, { tokens: number; cost: number; requests: number }>>(
      (acc, row) => {
        acc[row.model] = acc[row.model] ?? { tokens: 0, cost: 0, requests: 0 }
        acc[row.model].tokens += row.total_tokens
        acc[row.model].cost += row.estimated_cost_usd
        acc[row.model].requests += 1
        return acc
      },
      {}
    )

    return {
      data: {
        summary: {
          period: `${year}-${String(month).padStart(2, '0')}`,
          totalCostUsd: totalCost,
          totalTokens,
          requestCount,
          budgetUsd: MONTHLY_BUDGET_USD,
          budgetUsedPct: Math.round(budgetUsedPct * 100),
          byModel,
        },
      },
      error: null,
    }
  },
})

export const getSystemHealthTool = createTool({
  id: 'get-system-health',
  description:
    'Returns the latest health check status for all CurryDash services (Jira, GitHub, Supabase Realtime, webhooks). Query has a 3-second timeout.',
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

    const supabase = getSupabaseAdmin()

    let data:
      | { service: string; status: string; latency_ms: number | null; checked_at: string }[]
      | null = null
    let error: { message: string } | null = null

    try {
      const result = await withTimeout(
        (async () =>
          supabase
            .from('system_health')
            .select('service, status, latency_ms, checked_at')
            .order('checked_at', { ascending: false }))(),
        SUPABASE_TIMEOUT_MS
      )
      data = result.data
      error = result.error
    } catch (timeoutErr: unknown) {
      logger.error('System health query timed out', {
        correlationId,
        source: 'ai',
        data: { error: String(timeoutErr) },
      })
      return {
        data: null,
        error: { code: 'SUPABASE_TIMEOUT', message: "I couldn't retrieve that data — query timed out" },
      }
    }

    if (error) {
      logger.warn('Failed to fetch system health', {
        correlationId,
        source: 'ai',
        data: { error: error.message },
      })
      return {
        data: null,
        error: { code: 'SUPABASE_ERROR', message: `I couldn't retrieve that data — ${error.message}` },
      }
    }

    // Return latest entry per service
    const latest = Object.values(
      (data ?? []).reduce<Record<string, NonNullable<typeof data>[0]>>((acc, row) => {
        if (!acc[row.service]) {
          acc[row.service] = row
        }
        return acc
      }, {})
    )

    return { data: { services: latest }, error: null }
  },
})
