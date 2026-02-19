import { createTool } from '@mastra/core'
import { z } from 'zod'
import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'
import { logger } from '@/lib/logger'

const MONTHLY_BUDGET_USD = 50
const BUDGET_WARN_THRESHOLD = 0.8

function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL ?? ''
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? ''
  return createClient<Database>(url, key)
}

export const getAiUsageSummaryTool = createTool({
  id: 'get-ai-usage-summary',
  description:
    'Retrieves AI token usage and cost summary from the Supabase ai_usage table. Useful for admins monitoring the $50/month AI budget.',
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
  }),
  execute: async ({ context }) => {
    const now = new Date()
    const year = context.year ?? now.getFullYear()
    const month = context.month ?? now.getMonth() + 1

    const startDate = new Date(year, month - 1, 1).toISOString()
    const endDate = new Date(year, month, 1).toISOString()

    const supabase = getSupabaseAdmin()
    const { data, error } = await supabase
      .from('ai_usage')
      .select('model, prompt_tokens, completion_tokens, total_tokens, estimated_cost_usd')
      .gte('created_at', startDate)
      .lt('created_at', endDate)

    if (error) {
      logger.warn('Failed to fetch AI usage', {
        source: 'ai',
        data: { error: error.message },
      })
      return { summary: null, error: error.message }
    }

    const rows = data ?? []
    const totalCost = rows.reduce((sum, r) => sum + r.estimated_cost_usd, 0)
    const totalTokens = rows.reduce((sum, r) => sum + r.total_tokens, 0)
    const requestCount = rows.length

    const budgetUsedPct = totalCost / MONTHLY_BUDGET_USD

    if (budgetUsedPct >= BUDGET_WARN_THRESHOLD) {
      logger.warn('AI monthly budget at 80%+ threshold', {
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
      summary: {
        period: `${year}-${String(month).padStart(2, '0')}`,
        totalCostUsd: totalCost,
        totalTokens,
        requestCount,
        budgetUsd: MONTHLY_BUDGET_USD,
        budgetUsedPct: Math.round(budgetUsedPct * 100),
        byModel,
      },
    }
  },
})

export const getSystemHealthTool = createTool({
  id: 'get-system-health',
  description:
    'Returns the latest health check status for all CurryDash services (Jira, GitHub, Supabase Realtime, webhooks).',
  inputSchema: z.object({}),
  execute: async () => {
    const supabase = getSupabaseAdmin()
    const { data, error } = await supabase
      .from('system_health')
      .select('service, status, latency_ms, checked_at')
      .order('checked_at', { ascending: false })

    if (error) {
      logger.warn('Failed to fetch system health', {
        source: 'ai',
        data: { error: error.message },
      })
      return { services: [], error: error.message }
    }

    // Return latest entry per service
    const latest = Object.values(
      (data ?? []).reduce<Record<string, (typeof data)[0]>>((acc, row) => {
        if (!acc[row.service]) {
          acc[row.service] = row
        }
        return acc
      }, {})
    )

    return { services: latest }
  },
})
