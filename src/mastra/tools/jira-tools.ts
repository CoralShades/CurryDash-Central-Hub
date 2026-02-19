import { createTool } from '@mastra/core'
import { z } from 'zod'
import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'
import { logger } from '@/lib/logger'

function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL ?? ''
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? ''
  return createClient<Database>(url, key)
}

export const getActiveSprintIssuesTool = createTool({
  id: 'get-active-sprint-issues',
  description:
    'Retrieves active sprint issues for a Jira project from the Supabase cache. Returns issue key, summary, status, priority, assignee, and story points.',
  inputSchema: z.object({
    projectKey: z.string().min(1).describe('The Jira project key, e.g. "CD"'),
    limit: z.number().int().min(1).max(200).optional().default(50),
  }),
  execute: async ({ context }) => {
    const { projectKey, limit } = context
    const supabase = getSupabaseAdmin()
    const { data, error } = await supabase
      .from('jira_issues')
      .select(
        `id, issue_key, summary, status, priority, assignee_email, story_points, updated_at,
         jira_projects!inner(project_key)`
      )
      .eq('jira_projects.project_key', projectKey)
      .not('sprint_id', 'is', null)
      .order('updated_at', { ascending: false })
      .limit(limit ?? 50)

    if (error) {
      logger.warn('Failed to fetch active sprint issues', {
        source: 'ai',
        data: { projectKey, error: error.message },
      })
      return { issues: [], error: error.message }
    }

    return { issues: data ?? [] }
  },
})

export const getJiraProjectsSummaryTool = createTool({
  id: 'get-jira-projects-summary',
  description:
    'Returns a summary of all Jira projects synced to CurryDash, including project key, name, and last sync time.',
  inputSchema: z.object({}),
  execute: async () => {
    const supabase = getSupabaseAdmin()
    const { data, error } = await supabase
      .from('jira_projects')
      .select('id, project_key, name, synced_at')
      .order('name', { ascending: true })

    if (error) {
      logger.warn('Failed to fetch Jira projects', {
        source: 'ai',
        data: { error: error.message },
      })
      return { projects: [], error: error.message }
    }

    return { projects: data ?? [] }
  },
})
