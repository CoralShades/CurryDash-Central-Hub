import { createAdminClient } from '@/lib/supabase/admin'
import { StalenessIndicator } from '@/components/shared/staleness-indicator'
import { PrStatusCard, extractReviewStatus, extractCiStatus } from './pr-status-card'
import type { Role } from '@/types/roles'

export interface PullRequestRow {
  id: string
  prNumber: number
  title: string
  state: string
  author: string | null
  authorAvatarUrl: string | null
  headBranch: string
  baseBranch: string
  repoFullName: string
  repoName: string
  htmlUrl: string | null
  reviewStatus: 'approved' | 'changes_requested' | 'pending'
  ciStatus: 'success' | 'failure' | 'pending' | null
  additions: number
  deletions: number
  changedFiles: number
  isDraft: boolean
  mergedAt: string | null
  createdAt: string
  updatedAt: string
  syncedAt: string | null
  isStale: boolean
}

interface PrStatusWidgetProps {
  role: Role
}

/**
 * PrStatusWidget — async Server Component.
 * Reads open PRs from Supabase cache and passes to interactive Client Component.
 * ISR cache invalidated via revalidateTag('github-prs') from webhook handler.
 */
export async function PrStatusWidget({ role }: PrStatusWidgetProps) {
  let prs: PullRequestRow[] = []
  let syncedAt: string | null = null

  try {
    const supabase = createAdminClient()

    const { data: rows } = await supabase
      .from('github_pull_requests')
      .select(`
        id, pr_number, title, state, author,
        head_branch, base_branch, raw_payload, created_at, updated_at,
        github_repos!github_pull_requests_github_repo_id_fkey (
          full_name, name
        )
      `)
      .eq('state', 'open')
      .order('updated_at', { ascending: false })
      .limit(50)

    if (rows && rows.length > 0) {
      const threeDaysAgo = new Date()
      threeDaysAgo.setDate(threeDaysAgo.getDate() - 3)

      prs = rows.map((row) => {
        const isStale = new Date(row.updated_at) < threeDaysAgo

        if (!syncedAt || row.updated_at > syncedAt) {
          syncedAt = row.updated_at
        }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const repo = row.github_repos as any
        const rawPayload = (row.raw_payload ?? {}) as Record<string, unknown>

        return {
          id: row.id,
          prNumber: row.pr_number,
          title: row.title,
          state: row.state,
          author: row.author,
          authorAvatarUrl: (rawPayload.user as Record<string, unknown> | null)?.avatar_url as string | null ?? null,
          headBranch: row.head_branch ?? '',
          baseBranch: row.base_branch ?? '',
          repoFullName: repo?.full_name ?? 'unknown/repo',
          repoName: repo?.name ?? 'unknown',
          htmlUrl: (rawPayload.html_url as string | null) ?? null,
          reviewStatus: extractReviewStatus(rawPayload),
          ciStatus: extractCiStatus(rawPayload),
          additions: (rawPayload.additions as number | null) ?? 0,
          deletions: (rawPayload.deletions as number | null) ?? 0,
          changedFiles: (rawPayload.changed_files as number | null) ?? 0,
          isDraft: (rawPayload.draft as boolean | null) ?? false,
          mergedAt: (rawPayload.merged_at as string | null) ?? null,
          createdAt: (rawPayload.created_at as string | null) ?? row.created_at,
          updatedAt: (rawPayload.updated_at as string | null) ?? row.updated_at,
          syncedAt: row.updated_at,
          isStale,
        } satisfies PullRequestRow
      })
    }
  } catch {
    throw new Error('Failed to load pull request data')
  }

  if (prs.length === 0) {
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
        <span style={{ fontSize: '2rem' }} aria-hidden="true">🔀</span>
        <p style={{ margin: 0, fontSize: '0.875rem', fontWeight: 500, color: 'var(--color-text)' }}>
          Connect GitHub to see pull request activity
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
          Pull Requests
        </p>
        {syncedAt && <StalenessIndicator updatedAt={syncedAt} />}
      </div>

      <PrStatusCard prs={prs} role={role} />
    </div>
  )
}
