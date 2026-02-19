import { Agent } from '@mastra/core'
import { anthropic } from '@ai-sdk/anthropic'
import { buildSystemPrompt } from './system-prompts'
import { HAIKU_MODEL_ID, SONNET_MODEL_ID, MAX_TOKENS_PER_CALL, selectModel } from './model-routing'
import type { QueryType } from './model-routing'
import { getActiveSprintIssuesTool, getJiraProjectsSummaryTool } from '../tools/jira-tools'
import { getPullRequestsTool, getWorkflowRunsTool } from '../tools/github-tools'
import { getAiUsageSummaryTool, getSystemHealthTool } from '../tools/supabase-tools'
import type { Role } from '@/types/roles'

const DASHBOARD_TOOLS = {
  getActiveSprintIssues: getActiveSprintIssuesTool,
  getJiraProjectsSummary: getJiraProjectsSummaryTool,
  getPullRequests: getPullRequestsTool,
  getWorkflowRuns: getWorkflowRunsTool,
  getAiUsageSummary: getAiUsageSummaryTool,
  getSystemHealth: getSystemHealthTool,
}

/**
 * Creates the main CopilotKit-connected dashboard agent for a given role.
 *
 * Role sourced from JWT claims (authoritative) — never from client-side state.
 * Uses Haiku by default (cost-effective for status checks and data lookups).
 * Pass `queryType: 'complex' | 'report' | 'multi_tool_analysis' | 'widget_creation'`
 * to `createDashboardAgentForQuery` to get a Sonnet-backed agent for heavy work.
 *
 * Token budget: maxTokens 4,000 per call; caller is responsible for enforcing the
 * 8,000-token session cap via `isSessionCapExceeded` before invoking generate/stream.
 */
export function createDashboardAgent(role: Role) {
  return new Agent({
    name: 'dashboard-agent',
    instructions: buildSystemPrompt(role),
    model: anthropic(HAIKU_MODEL_ID),
    tools: DASHBOARD_TOOLS,
    defaultGenerateOptions: {
      maxTokens: MAX_TOKENS_PER_CALL,
    },
  })
}

/**
 * Creates a dashboard agent whose model is selected based on query complexity.
 * Simple queries → Haiku. Complex queries → Sonnet.
 */
export function createDashboardAgentForQuery(role: Role, queryType: QueryType) {
  const modelId = selectModel(queryType)
  return new Agent({
    name: 'dashboard-agent',
    instructions: buildSystemPrompt(role),
    model: anthropic(modelId),
    tools: DASHBOARD_TOOLS,
    defaultGenerateOptions: {
      maxTokens: MAX_TOKENS_PER_CALL,
    },
  })
}

export { HAIKU_MODEL_ID, SONNET_MODEL_ID }
