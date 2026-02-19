import { createAdminClient } from '@/lib/supabase/admin'
import { StalenessIndicator } from '@/components/shared/staleness-indicator'
import { CicdStatusCard } from './cicd-status-card'

/** A single workflow run row passed to the client component. */
export interface WorkflowRunRow {
  id: string
  runId: number
  workflowName: string
  headBranch: string | null
  event: string | null
  status: string
  conclusion: string | null
  htmlUrl: string | null
  runNumber: number | null
  durationSeconds: number | null
  repoFullName: string
  createdAt: string
  updatedAt: string
}

/** A single daily commit activity row passed to the client component. */
export interface CommitActivityRow {
  id: string
  commitDate: string
  commitCount: number
  repoFullName: string
}

/**
 * CicdStatusWidget — async Server Component.
 * Reads workflow runs and commit activity from Supabase cache and passes to
 * interactive Client Component.
 * ISR cache invalidated via revalidateTag('github-ci') from webhook handler.
 */
export async function CicdStatusWidget() {
  let runs: WorkflowRunRow[] = []
  let activity: CommitActivityRow[] = []
  let syncedAt: string | null = null

  try {
    const supabase = createAdminClient()

    // Fetch recent workflow runs (last 50 across all repos)
    const { data: runRows } = await supabase
      .from('github_workflow_runs')
      .select(`
        id, run_id, workflow_name, head_branch, event,
        status, conclusion, html_url, run_number, duration_seconds,
        github_created_at, github_updated_at, synced_at, created_at, updated_at,
        github_repos!github_workflow_runs_github_repo_id_fkey (
          full_name
        )
      `)
      .order('github_created_at', { ascending: false })
      .limit(50)

    if (runRows && runRows.length > 0) {
      runs = runRows.map((row) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const repo = row.github_repos as any
        if (row.synced_at && (!syncedAt || row.synced_at > syncedAt)) {
          syncedAt = row.synced_at
        }
        return {
          id: row.id,
          runId: row.run_id,
          workflowName: row.workflow_name,
          headBranch: row.head_branch,
          event: row.event,
          status: row.status,
          conclusion: row.conclusion,
          htmlUrl: row.html_url,
          runNumber: row.run_number,
          durationSeconds: row.duration_seconds,
          repoFullName: repo?.full_name ?? 'unknown/repo',
          createdAt: row.github_created_at ?? row.created_at,
          updatedAt: row.github_updated_at ?? row.updated_at,
        } satisfies WorkflowRunRow
      })
    }

    // Fetch 14 days of commit activity
    const fourteenDaysAgo = new Date()
    fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14)
    const dateStr = fourteenDaysAgo.toISOString().slice(0, 10)

    const { data: activityRows } = await supabase
      .from('github_commit_activity')
      .select(`
        id, commit_date, commit_count,
        github_repos!github_commit_activity_github_repo_id_fkey (
          full_name
        )
      `)
      .gte('commit_date', dateStr)
      .order('commit_date', { ascending: false })

    if (activityRows && activityRows.length > 0) {
      // Aggregate by date across all repos
      const dateMap = new Map<string, number>()
      for (const row of activityRows) {
        const existing = dateMap.get(row.commit_date) ?? 0
        dateMap.set(row.commit_date, existing + row.commit_count)
      }
      activity = Array.from(dateMap.entries()).map(([commitDate, commitCount]) => ({
        id: commitDate,
        commitDate,
        commitCount,
        repoFullName: 'all',
      }))
    }
  } catch {
    throw new Error('Failed to load CI/CD status data')
  }

  if (runs.length === 0) {
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
        <span style={{ fontSize: '2rem' }} aria-hidden="true">⚙️</span>
        <p style={{ margin: 0, fontSize: '0.875rem', fontWeight: 500, color: 'var(--color-text)' }}>
          Connect GitHub to see CI/CD status
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
          CI/CD Pipeline
        </p>
        {syncedAt && <StalenessIndicator updatedAt={syncedAt} />}
      </div>

      <CicdStatusCard runs={runs} activity={activity} />
    </div>
  )
}
