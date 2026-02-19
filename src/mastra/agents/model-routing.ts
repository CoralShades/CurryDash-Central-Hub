import { MAX_AI_TOKENS_PER_REQUEST, MAX_AI_TOKENS_PER_SESSION } from '@/lib/constants'

export const HAIKU_MODEL_ID = 'claude-haiku-4-5-20251001'
export const SONNET_MODEL_ID = 'claude-sonnet-4-6'

export const MAX_TOKENS_PER_CALL = MAX_AI_TOKENS_PER_REQUEST
export const SESSION_TOKEN_CAP = MAX_AI_TOKENS_PER_SESSION

export type QueryType =
  | 'simple'
  | 'complex'
  | 'report'
  | 'status_check'
  | 'data_lookup'
  | 'multi_tool_analysis'
  | 'widget_creation'

const COMPLEX_QUERY_TYPES: QueryType[] = [
  'complex',
  'report',
  'multi_tool_analysis',
  'widget_creation',
]

/** Route a query to the appropriate model ID based on complexity. */
export function selectModel(queryType: QueryType): string {
  return COMPLEX_QUERY_TYPES.includes(queryType) ? SONNET_MODEL_ID : HAIKU_MODEL_ID
}

/** Returns true when a session has consumed its token budget. */
export function isSessionCapExceeded(sessionTokens: number): boolean {
  return sessionTokens >= SESSION_TOKEN_CAP
}

// Cost per 1M tokens in USD (approximate published rates)
const COST_PER_MILLION: Record<string, number> = {
  [HAIKU_MODEL_ID]: 0.8,   // $0.80 / 1M input tokens (Haiku)
  [SONNET_MODEL_ID]: 3.0,  // $3.00 / 1M input tokens (Sonnet)
}

/** Rough cost estimate in USD for the given model and token count. */
export function estimateTokenCost(modelId: string, tokens: number): number {
  if (tokens === 0) return 0
  const ratePerMillion = COST_PER_MILLION[modelId] ?? COST_PER_MILLION[SONNET_MODEL_ID]
  return (tokens / 1_000_000) * ratePerMillion
}
