export const MAX_JIRA_CALLS_PER_MINUTE = 5
export const JWT_EXPIRY_HOURS = 24
export const STALENESS_AMBER_MS = 10 * 60 * 1000 // 10 minutes
export const STALENESS_RED_MS = 30 * 60 * 1000 // 30 minutes
export const STALENESS_SECONDARY_MS = 2 * 60 * 1000 // 2 minutes
export const MAX_AI_TOKENS_PER_REQUEST = 4000
export const MAX_AI_TOKENS_PER_SESSION = 8000
export const WEBHOOK_MAX_RETRIES = 3
export const WIDGET_GRID_COLUMNS = 12
export const SIDEBAR_WIDTH_EXPANDED = 256
export const SIDEBAR_WIDTH_COLLAPSED = 64
/** Monthly AI API spend ceiling in USD (ARCH-11) */
export const AI_BUDGET_CEILING_USD = 50
/** Fraction of budget at which a warn log + notification is triggered (0.8 = 80%) */
export const AI_BUDGET_WARN_PERCENT = 0.8
