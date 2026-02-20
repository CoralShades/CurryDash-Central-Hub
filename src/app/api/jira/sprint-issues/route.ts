import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

/**
 * GET /api/jira/sprint-issues?projectKey={key}
 * Returns all issues in the active sprint for a given project key.
 * Used by the SprintDetailView client component.
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  const projectKey = request.nextUrl.searchParams.get('projectKey')

  if (!projectKey) {
    return NextResponse.json(
      { data: null, error: { code: 'INVALID_PARAMS', message: 'projectKey is required' } },
      { status: 400 }
    )
  }

  try {
    const supabase = createAdminClient()

    // Look up the project
    const { data: project } = await supabase
      .from('jira_projects')
      .select('id')
      .eq('project_key', projectKey)
      .maybeSingle()

    if (!project) {
      return NextResponse.json(
        { data: [], error: null },
        { status: 200 }
      )
    }

    // Find active sprint
    const { data: sprint } = await supabase
      .from('jira_sprints')
      .select('id')
      .eq('jira_project_id', project.id)
      .eq('state', 'active')
      .maybeSingle()

    if (!sprint) {
      return NextResponse.json({ data: [], error: null }, { status: 200 })
    }

    // Get all issues in this sprint
    const { data: issues, error } = await supabase
      .from('jira_issues')
      .select('issue_key, summary, status, assignee_email, priority, raw_payload')
      .eq('jira_project_id', project.id)
      .eq('jira_sprint_id', sprint.id)
      .order('status', { ascending: true })

    if (error) {
      return NextResponse.json(
        { data: null, error: { code: 'DB_ERROR', message: error.message } },
        { status: 500 }
      )
    }

    return NextResponse.json({ data: issues ?? [], error: null }, { status: 200 })
  } catch (err) {
    return NextResponse.json(
      {
        data: null,
        error: {
          code: 'SERVER_ERROR',
          message: err instanceof Error ? err.message : 'An unexpected error occurred',
        },
      },
      { status: 500 }
    )
  }
}
