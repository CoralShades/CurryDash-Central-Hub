import { Agent } from '@mastra/core'
import { anthropic } from '@ai-sdk/anthropic'
import { buildSystemPrompt } from './system-prompts'
import { SONNET_MODEL_ID, MAX_TOKENS_PER_CALL } from './model-routing'
import { getActiveSprintIssuesTool, getJiraProjectsSummaryTool } from '../tools/jira-tools'
import { getPullRequestsTool, getWorkflowRunsTool } from '../tools/github-tools'
import { getAiUsageSummaryTool, getSystemHealthTool } from '../tools/supabase-tools'
import type { Role } from '@/types/roles'

/**
 * Creates the report generation agent for a given role.
 *
 * Always uses Claude Sonnet — report generation is a complex, multi-tool operation
 * that requires higher reasoning capability (ARCH-11).
 *
 * Role sourced from JWT claims (authoritative) — never from client-side state.
 * Token budget: maxTokens 4,000 per call; caller enforces 8,000-token session cap.
 */
export function createReportAgent(role: Role) {
  const roleInstructions = buildSystemPrompt(role)
  return new Agent({
    name: 'report-agent',
    instructions: `${roleInstructions}

You specialize in generating comprehensive, structured reports from CurryDash data.
When generating a report:
1. Gather relevant data using the available tools
2. Synthesize the data into a clear, role-appropriate narrative
3. Include trend analysis where time-series data is available
4. Highlight risks, blockers, and action items
5. Format output in clean Markdown for readability`,
    model: anthropic(SONNET_MODEL_ID),
    tools: {
      getActiveSprintIssues: getActiveSprintIssuesTool,
      getJiraProjectsSummary: getJiraProjectsSummaryTool,
      getPullRequests: getPullRequestsTool,
      getWorkflowRuns: getWorkflowRunsTool,
      getAiUsageSummary: getAiUsageSummaryTool,
      getSystemHealth: getSystemHealthTool,
    },
    defaultGenerateOptions: {
      maxTokens: MAX_TOKENS_PER_CALL,
    },
  })
}
