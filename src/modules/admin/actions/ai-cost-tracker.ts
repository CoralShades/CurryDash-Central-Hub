'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { requireAuth } from '@/lib/auth'
import { logger } from '@/lib/logger'
import type { ApiResponse } from '@/types/api'
import {
  MAX_AI_TOKENS_PER_REQUEST,
  MAX_AI_TOKENS_PER_SESSION,
  AI_BUDGET_CEILING_USD,
  AI_BUDGET_WARN_PERCENT,
} from '@/lib/constants'
import { aiCostQuerySchema, type AiCostQuery } from '../schemas/ai-cost-tracker-schema'

// ── Types ─────────────────────────────────────────────────────────────────────

export interface DailyAiSpend {
  date: string
  queries: number
  totalTokens: number
  estimatedCost: number
}

export interface DailyAiBreakdown {
  date: string
  queries: number
  haikuQueries: number
  sonnetQueries: number
  totalTokens: number
  estimatedCost: number
}

export interface ModelUsage {
  model: string
  modelLabel: string
  queries: number
  tokens: number
  cost: number
}

export interface TopExpensiveRequest {
  date: string
  model: string
  modelLabel: string
  promptTokens: number
  completionTokens: number
  totalTokens: number
  estimatedCost: number
}

export interface AiCostData {
  currentMonthSpend: number
  budgetCeilingUsd: number
  budgetWarnPercent: number
  spendPercent: number
  totalQueriesThisMonth: number
  dailySpend: DailyAiSpend[]
  modelBreakdown: ModelUsage[]
  dailyBreakdownTable: DailyAiBreakdown[]
  topExpensiveRequests: TopExpensiveRequest[]
  cappedRequestsThisMonth: number
  perRequestTokenCap: number
  perSessionTokenCap: number
  aiAvailabilityPercent: number | null
  budgetAlertTriggered: boolean
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function getModelLabel(model: string): string {
  if (model.includes('haiku')) return 'Haiku'
  if (model.includes('sonnet')) return 'Sonnet'
  if (model.includes('opus')) return 'Opus'
  return model
}

// ── Server Action ─────────────────────────────────────────────────────────────

/**
 * Fetches AI cost and usage data for the specified month (default: current month).
 * Aggregates monthly spend, model breakdown, daily trends, and token cap stats.
 * Emits a warn log and creates a budget_alert notification when spend >= 80% of ceiling.
 * Admin-only.
 */
export async function getAiCostData(
  input?: AiCostQuery
): Promise<ApiResponse<AiCostData>> {
  try {
    const user = await requireAuth('admin')

    const validation = aiCostQuerySchema.safeParse(input ?? {})
    if (!validation.success) {
      return {
        data: null,
        error: {
          code: 'VALIDATION_ERROR',
          message: validation.error.errors[0]?.message ?? 'Invalid input',
        },
      }
    }

    const now = new Date()
    const year = validation.data.year ?? now.getUTCFullYear()
    const month = validation.data.month ?? now.getUTCMonth() + 1

    const monthStart = new Date(Date.UTC(year, month - 1, 1))
    const monthEnd = new Date(Date.UTC(year, month, 1))
    // 30-day rolling window ending today
    const thirtyDaysAgo = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - 29)
    )

    const supabase = createAdminClient()

    // Fetch all AI usage records for the month
    const { data: rows, error: dbError } = await supabase
      .from('ai_usage')
      .select(
        'model, prompt_tokens, completion_tokens, total_tokens, estimated_cost_usd, request_type, created_at'
      )
      .gte('created_at', monthStart.toISOString())
      .lt('created_at', monthEnd.toISOString())
      .order('created_at', { ascending: false })

    if (dbError) {
      logger.error('Failed to fetch AI usage data', {
        source: 'admin',
        data: { error: dbError.message },
      })
      return {
        data: null,
        error: { code: 'DB_ERROR', message: 'Failed to load AI cost data' },
      }
    }

    const allRows = rows ?? []

    // ── Monthly totals ────────────────────────────────────────────────────────
    const currentMonthSpend = allRows.reduce(
      (sum, r) => sum + Number(r.estimated_cost_usd),
      0
    )
    const totalQueriesThisMonth = allRows.length
    const spendPercent = Math.min(
      100,
      Math.round((currentMonthSpend / AI_BUDGET_CEILING_USD) * 100)
    )
    const cappedRequestsThisMonth = allRows.filter(
      (r) => r.completion_tokens >= MAX_AI_TOKENS_PER_REQUEST
    ).length

    // ── Model breakdown ───────────────────────────────────────────────────────
    const modelMap = new Map<string, { queries: number; tokens: number; cost: number }>()
    for (const row of allRows) {
      const existing = modelMap.get(row.model) ?? { queries: 0, tokens: 0, cost: 0 }
      modelMap.set(row.model, {
        queries: existing.queries + 1,
        tokens: existing.tokens + row.total_tokens,
        cost: existing.cost + Number(row.estimated_cost_usd),
      })
    }
    const modelBreakdown: ModelUsage[] = Array.from(modelMap.entries()).map(
      ([model, stats]) => ({ model, modelLabel: getModelLabel(model), ...stats })
    )

    // ── Daily aggregation ─────────────────────────────────────────────────────
    const dailyMap = new Map<
      string,
      { queries: number; haikuQueries: number; sonnetQueries: number; totalTokens: number; cost: number }
    >()
    for (const row of allRows) {
      const date = row.created_at.slice(0, 10)
      const isHaiku = row.model.includes('haiku')
      const existing = dailyMap.get(date) ?? {
        queries: 0,
        haikuQueries: 0,
        sonnetQueries: 0,
        totalTokens: 0,
        cost: 0,
      }
      dailyMap.set(date, {
        queries: existing.queries + 1,
        haikuQueries: existing.haikuQueries + (isHaiku ? 1 : 0),
        sonnetQueries: existing.sonnetQueries + (isHaiku ? 0 : 1),
        totalTokens: existing.totalTokens + row.total_tokens,
        cost: existing.cost + Number(row.estimated_cost_usd),
      })
    }

    // Build 30-day rolling window (fill gaps with zeros)
    const dailySpend: DailyAiSpend[] = []
    const dailyBreakdownTable: DailyAiBreakdown[] = []
    for (let i = 29; i >= 0; i--) {
      const d = new Date(thirtyDaysAgo.getTime() + i * 86_400_000)
      const dateStr = d.toISOString().slice(0, 10)
      const stats = dailyMap.get(dateStr) ?? {
        queries: 0,
        haikuQueries: 0,
        sonnetQueries: 0,
        totalTokens: 0,
        cost: 0,
      }
      dailySpend.push({
        date: dateStr,
        queries: stats.queries,
        totalTokens: stats.totalTokens,
        estimatedCost: stats.cost,
      })
      dailyBreakdownTable.push({
        date: dateStr,
        queries: stats.queries,
        haikuQueries: stats.haikuQueries,
        sonnetQueries: stats.sonnetQueries,
        totalTokens: stats.totalTokens,
        estimatedCost: stats.cost,
      })
    }

    // ── Top 5 most expensive requests ─────────────────────────────────────────
    const topExpensiveRequests: TopExpensiveRequest[] = [...allRows]
      .sort((a, b) => b.total_tokens - a.total_tokens)
      .slice(0, 5)
      .map((r) => ({
        date: r.created_at.slice(0, 10),
        model: r.model,
        modelLabel: getModelLabel(r.model),
        promptTokens: r.prompt_tokens,
        completionTokens: r.completion_tokens,
        totalTokens: r.total_tokens,
        estimatedCost: Number(r.estimated_cost_usd),
      }))

    // ── Budget alert (ARCH-11) ─────────────────────────────────────────────────
    const budgetAlertTriggered =
      currentMonthSpend >= AI_BUDGET_CEILING_USD * AI_BUDGET_WARN_PERCENT

    if (budgetAlertTriggered) {
      logger.warn('AI budget threshold exceeded', {
        source: 'admin',
        data: {
          currentMonthSpend,
          spendPercent,
          budgetCeilingUsd: AI_BUDGET_CEILING_USD,
          warnPercent: AI_BUDGET_WARN_PERCENT,
        },
      })

      // Create in-app notification for the viewing admin (lazy, deduped per month)
      if (user.id) {
        try {
          const { count: existingAlerts } = await supabase
            .from('notifications')
            .select('id', { count: 'exact', head: true })
            .eq('user_id', user.id)
            .eq('type', 'budget_alert')
            .gte('created_at', monthStart.toISOString())

          if ((existingAlerts ?? 0) === 0) {
            await supabase.from('notifications').insert({
              user_id: user.id,
              type: 'budget_alert',
              title: `AI Budget at ${spendPercent}%`,
              message: `AI spending has reached ${spendPercent}% of the $${AI_BUDGET_CEILING_USD}/month budget ($${currentMonthSpend.toFixed(2)} spent). Review model routing to manage costs.`,
              is_read: false,
              action_url: '/admin/system-health',
            })
          }
        } catch {
          // Non-critical — best-effort notification creation
        }
      }
    }

    // ── AI availability from system_health ────────────────────────────────────
    let aiAvailabilityPercent: number | null = null
    const { data: healthRow } = await supabase
      .from('system_health')
      .select('status')
      .eq('source', 'anthropic')
      .maybeSingle()

    if (healthRow) {
      aiAvailabilityPercent =
        healthRow.status === 'connected'
          ? 100
          : healthRow.status === 'error'
            ? 0
            : null
    }

    return {
      data: {
        currentMonthSpend,
        budgetCeilingUsd: AI_BUDGET_CEILING_USD,
        budgetWarnPercent: AI_BUDGET_WARN_PERCENT,
        spendPercent,
        totalQueriesThisMonth,
        dailySpend,
        modelBreakdown,
        dailyBreakdownTable,
        topExpensiveRequests,
        cappedRequestsThisMonth,
        perRequestTokenCap: MAX_AI_TOKENS_PER_REQUEST,
        perSessionTokenCap: MAX_AI_TOKENS_PER_SESSION,
        aiAvailabilityPercent,
        budgetAlertTriggered,
      },
      error: null,
    }
  } catch (err) {
    logger.error('Unexpected error fetching AI cost data', {
      source: 'admin',
      data: { error: err },
    })
    return {
      data: null,
      error: { code: 'SERVER_ERROR', message: 'Failed to load AI cost data' },
    }
  }
}
