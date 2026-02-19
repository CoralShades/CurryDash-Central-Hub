import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'
import { logger } from '@/lib/logger'
import { estimateTokenCost } from '../agents/model-routing'

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
  }
}
