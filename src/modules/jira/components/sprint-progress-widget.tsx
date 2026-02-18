import { createAdminClient } from '@/lib/supabase/admin'
import { StalenessIndicator } from '@/components/shared/staleness-indicator'
import { SprintProgressCard } from './sprint-progress-card'

/** The 6 Jira projects displayed in the sprint progress widget (FR21) */
const TRACKED_PROJECT_KEYS = ['CUR', 'CAD', 'CAR', 'CPFP', 'PACK', 'CCW'] as const

export interface ProjectProgress {
  projectKey: string
  projectName: string
  sprintName: string
  startDate: string | null
  endDate: string | null
  totalIssues: number
  completedIssues: number
  totalPoints: number
  completedPoints: number
  syncedAt: string | null
}

/**
 * SprintProgressWidget — async Server Component.
 * Reads the active sprint and issue counts from Supabase cache.
 * Wrapped in ErrorBoundary + Suspense by WidgetCard.
 * ISR cache invalidated via revalidateTag('issues') from the Jira webhook handler.
 */
export async function SprintProgressWidget() {
  let projects: ProjectProgress[] = []
  let syncedAt: string | null = null

  try {
    const supabase = createAdminClient()

    // Fetch all 6 tracked projects
    const { data: projectRows } = await supabase
      .from('jira_projects')
      .select('id, project_key, name')
      .in('project_key', TRACKED_PROJECT_KEYS)

    if (projectRows && projectRows.length > 0) {
      // For each project, find active sprint + issue counts
      const progressItems = await Promise.all(
        projectRows.map(async (project) => {
          // Find the active sprint for this project
          const { data: sprintRow } = await supabase
            .from('jira_sprints')
            .select('id, name, start_date, end_date, synced_at')
            .eq('project_id', project.id)
            .eq('state', 'active')
            .maybeSingle()

          if (!sprintRow) {
            return {
              projectKey: project.project_key,
              projectName: project.name,
              sprintName: 'No active sprint',
              startDate: null,
              endDate: null,
              totalIssues: 0,
              completedIssues: 0,
              totalPoints: 0,
              completedPoints: 0,
              syncedAt: null,
            } satisfies ProjectProgress
          }

          // Count issues in this sprint
          const { data: issues } = await supabase
            .from('jira_issues')
            .select('status, story_points')
            .eq('project_id', project.id)
            .eq('sprint_id', sprintRow.id)

          const allIssues = issues ?? []
          const totalIssues = allIssues.length
          const completedIssues = allIssues.filter(
            (i) => i.status === 'Done' || i.status === 'Closed'
          ).length
          const totalPoints = allIssues.reduce((sum, i) => sum + (i.story_points ?? 0), 0)
          const completedPoints = allIssues
            .filter((i) => i.status === 'Done' || i.status === 'Closed')
            .reduce((sum, i) => sum + (i.story_points ?? 0), 0)

          if (sprintRow.synced_at && (!syncedAt || sprintRow.synced_at < syncedAt)) {
            syncedAt = sprintRow.synced_at
          }

          return {
            projectKey: project.project_key,
            projectName: project.name,
            sprintName: sprintRow.name,
            startDate: sprintRow.start_date,
            endDate: sprintRow.end_date,
            totalIssues,
            completedIssues,
            totalPoints,
            completedPoints,
            syncedAt: sprintRow.synced_at,
          } satisfies ProjectProgress
        })
      )

      // Sort to match TRACKED_PROJECT_KEYS order
      projects = TRACKED_PROJECT_KEYS
        .map((key) => progressItems.find((p) => p.projectKey === key))
        .filter((p): p is ProjectProgress => p !== undefined)
    }
  } catch {
    // Errors are caught by ErrorBoundary in WidgetCard
    throw new Error('Failed to load sprint progress data')
  }

  if (projects.length === 0) {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
          gap: 'var(--space-3)',
          padding: 'var(--space-4)',
          textAlign: 'center',
        }}
      >
        <span style={{ fontSize: '2rem' }} aria-hidden="true">📋</span>
        <p style={{ margin: 0, fontSize: '0.875rem', fontWeight: 500, color: 'var(--color-text)' }}>
          Connect Jira to see sprint progress
        </p>
        <a
          href="/admin/integrations"
          style={{
            fontSize: '0.8125rem',
            color: 'var(--color-turmeric)',
            textDecoration: 'underline',
          }}
        >
          Go to Integration Settings →
        </a>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 'var(--space-3)',
          flexShrink: 0,
        }}
      >
        <p
          style={{
            margin: 0,
            fontSize: '0.75rem',
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            color: 'var(--color-text-secondary)',
          }}
        >
          Sprint Progress
        </p>
        {syncedAt && <StalenessIndicator updatedAt={syncedAt} />}
      </div>

      {/* Project list — interactive drill-down via Client Component */}
      <SprintProgressCard projects={projects} />
    </div>
  )
}
