import { Mastra } from '@mastra/core'
import { createDashboardAgent } from './agents/dashboard-agent'
import { createReportAgent } from './agents/report-agent'

/**
 * Mastra instance — central registry for AI agents.
 *
 * NOTE: Agents here are initialised with the 'developer' role as a safe default.
 * At request time, use `createDashboardAgent(role)` or `createReportAgent(role)` to
 * create role-specific instances with JWT-sourced role context.
 */
export const mastra = new Mastra({
  agents: {
    dashboardAgent: createDashboardAgent('developer'),
    reportAgent: createReportAgent('developer'),
  },
})

// Re-export factories for route handler use
export { createDashboardAgent, createDashboardAgentForQuery } from './agents/dashboard-agent'
export { createReportAgent } from './agents/report-agent'

// Re-export model routing utilities for session management
export {
  selectModel,
  isSessionCapExceeded,
  estimateTokenCost,
  SESSION_TOKEN_CAP,
  MAX_TOKENS_PER_CALL,
  HAIKU_MODEL_ID,
  SONNET_MODEL_ID,
} from './agents/model-routing'

// Re-export usage recorder
export { recordAiUsage } from './lib/record-usage'
