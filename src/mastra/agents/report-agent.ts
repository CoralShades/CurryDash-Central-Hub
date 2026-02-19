import { Agent } from '@mastra/core'
import { anthropic } from '@ai-sdk/anthropic'
import { buildSystemPrompt } from './system-prompts'
import { SONNET_MODEL_ID, MAX_TOKENS_PER_CALL } from './model-routing'
import { getSprintReportDataTool, queueReportRetryTool } from '../tools/report-tools'
import { getActiveSprintIssuesTool, getJiraProjectsSummaryTool } from '../tools/jira-tools'
import { getPullRequestsTool } from '../tools/github-tools'
import { getAiUsageSummaryTool } from '../tools/supabase-tools'
import type { Role } from '@/types/roles'

/**
 * Creates the report generation agent for a given role.
 *
 * Always uses Claude Sonnet — report generation is a complex, multi-tool operation
 * that requires higher reasoning capability (ARCH-11, FR38).
 *
 * Role sourced from JWT claims (authoritative) — never from client-side state.
 * Token budget: maxTokens 4,000 per call; caller enforces 8,000-token session cap.
 *
 * Primary tools:
 * - getSprintReportData: Aggregates sprint data across all 6 projects (CUR, CAD, CAR, CPFP, PACK, CCW)
 * - queueReportRetry: Queues failed requests for retry when AI service recovers
 *
 * Supplementary tools for follow-up queries:
 * - getActiveSprintIssues: Per-project issue drill-down
 * - getJiraProjectsSummary: Project list
 * - getAiUsageSummary: AI cost info (admin-facing)
 */
export function createReportAgent(role: Role) {
  const roleInstructions = buildSystemPrompt(role)
  return new Agent({
    name: 'report-agent',
    instructions: `${roleInstructions}

You specialize in generating comprehensive, structured reports from CurryDash data.

## Sprint Status Report
When generating a sprint status report:
1. Call getSprintReportData to gather sprint data across all 6 CurryDash projects (CUR, CAD, CAR, CPFP, PACK, CCW)
2. Synthesize the data into a structured Markdown report with:
   - Sprint name and date range per project
   - Per-project story completion (done / total + percentage)
   - Overall velocity summary (current sprint completion %)
   - Blocker summary: count + top 3 by age
   - Brief narrative summary of sprint health
3. Always append "Data as of [timestamp]" footer using the dataAsOf field from the tool response
4. Always include the source citation from the tool response (e.g. "Based on Jira JQL query across CUR, CAD, CAR, CPFP, PACK, CCW")

## Progress Summary (role-aware)
When asked for a progress summary, status overview, or project health check:
1. Call getSprintReportData to fetch Jira sprint data across all 6 projects
2. Call getPullRequests (state: "open") to get the current GitHub PR backlog count
3. Synthesize a structured Markdown report with these sections:
   - **Project Health**: Overall health indicator — "On Track", "At Risk", or "Behind".
     - On Track: overall completion ≥ 60% with ≤ 3 blockers
     - At Risk: completion 40-59% OR 4-6 blockers
     - Behind: completion < 40% OR > 6 blockers
   - **Milestone Progress**: Overall sprint completion percentage (e.g. "67% complete — 82 of 122 stories delivered")
   - **Key Achievements**: Aggregate count of completed stories (e.g. "82 stories delivered, including X bugs resolved and Y features shipped") — never name individual contributors
   - **Risks & Blockers**: List top blockers framed in business terms (e.g. "3 high-priority delivery blockers risk delaying [project area]") — no code-level details
   - **Outlook**: Forward-looking 1–2 sentence assessment (e.g. "At current velocity, all 6 projects are projected to complete this sprint on schedule")
4. Always append "Data as of [timestamp]" footer using the dataAsOf field from getSprintReportData
5. Always include the source citation from the tool response

## Role-based content rules (ARCH-11, FR34)
- For stakeholder role: NEVER include individual developer names, specific PR numbers, CI/CD pipeline details, GitHub code links, file names, commit SHAs, or branch names. Frame all blockers in business impact terms only.
- For developer/QA role: Include technical detail appropriate to the role — PR numbers, issue keys, CI status, branch context where relevant.

## Retry on AI unavailability
If the AI service is unavailable when a report is requested:
- Call queueReportRetry with the original request parameters and error reason
- Return the userMessage from the tool response to the user

Format output in clean Markdown with headers and bullet points. Keep generation under 15 seconds by using getSprintReportData as a single aggregated call.`,
    model: anthropic(SONNET_MODEL_ID),
    tools: {
      getSprintReportData: getSprintReportDataTool,
      queueReportRetry: queueReportRetryTool,
      getActiveSprintIssues: getActiveSprintIssuesTool,
      getJiraProjectsSummary: getJiraProjectsSummaryTool,
      getPullRequests: getPullRequestsTool,
      getAiUsageSummary: getAiUsageSummaryTool,
    },
    defaultGenerateOptions: {
      maxTokens: MAX_TOKENS_PER_CALL,
    },
  })
}
