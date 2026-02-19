import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'
import { logger } from '@/lib/logger'
import { estimateTokenCost } from '../agents/model-routing'
import { AI_BUDGET_CEILING_USD, AI_BUDGET_WARN_PERCENT } from '@/lib/constants'
import { sendAdminNotification } from '@/modules/notifications/lib/send-notification'

interface RecordUsageParams {
  userId?: string
  model: string
  promptTokens: number
  completionTokens: number
  requestType?: string
}

/**
 * Records a single AI completion call's token usage to the ai_usage table.
 * Used for cost tracking against the $50/month budget (ARCH-11).
 */
export async function recordAiUsage(params: RecordUsageParams): Promise<void> {
  const { userId, model, promptTokens, completionTokens, requestType } = params
  const totalTokens = promptTokens + completionTokens
  const estimatedCostUsd = estimateTokenCost(model, totalTokens)

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL ?? ''
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? ''
  const supabase = createClient<Database>(url, key)

  const { error } = await supabase.from('ai_usage').insert({
    user_id: userId ?? null,
    model,
    prompt_tokens: promptTokens,
    completion_tokens: completionTokens,
    total_tokens: totalTokens,
    estimated_cost_usd: estimatedCostUsd,
    request_type: requestType ?? null,
  })

  if (error) {
    logger.warn('Failed to record AI usage', {
      source: 'ai',
      data: { model, totalTokens, error: error.message },
    })
    return
  }

  // ARCH-11: Check if monthly AI spend has crossed 80% of budget ceiling
  void checkAndNotifyBudgetThreshold(supabase)
}

/**
 * Checks current-month AI spend against the 80% budget threshold.
 * Sends one admin notification per day if threshold is exceeded.
 * Best-effort — errors are swallowed so they don't affect the calling path.
 */
async function checkAndNotifyBudgetThreshold(
  supabase: ReturnType<typeof createClient<Database>>
): Promise<void> {
  try {
    const startOfMonth = new Date()
    startOfMonth.setDate(1)
    startOfMonth.setHours(0, 0, 0, 0)

    const { data: usageRows, error: usageError } = await supabase
      .from('ai_usage')
      .select('estimated_cost_usd')
      .gte('created_at', startOfMonth.toISOString())

    if (usageError ?? !usageRows) return

    const totalCostUsd = usageRows.reduce(
      (sum, row) => sum + (row.estimated_cost_usd ?? 0),
      0
    )
    const threshold = AI_BUDGET_CEILING_USD * AI_BUDGET_WARN_PERCENT

    if (totalCostUsd < threshold) return

    logger.warn('AI monthly spend has crossed 80% of budget ceiling', {
      source: 'ai',
      data: { totalCostUsd, threshold, ceiling: AI_BUDGET_CEILING_USD },
    })

    // Guard: only send one notification per day to avoid spamming
    const todayStart = new Date()
    todayStart.setHours(0, 0, 0, 0)

    const { data: existingNotif } = await supabase
      .from('notifications')
      .select('id')
      .eq('type', 'ai_budget')
      .gte('created_at', todayStart.toISOString())
      .limit(1)

    if (existingNotif && existingNotif.length > 0) return

    await sendAdminNotification({
      type: 'ai_budget',
      title: 'AI Budget Threshold Reached',
      message: `AI spend has reached 80% ($${totalCostUsd.toFixed(2)}) of monthly budget ($${AI_BUDGET_CEILING_USD})`,
      actionUrl: '/admin/system-health',
    })
  } catch {
    // Swallow — budget check is non-critical
  }
}
