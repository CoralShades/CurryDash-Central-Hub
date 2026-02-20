'use client'

import { useState } from 'react'
import type { PullRequestRow } from './pr-status-widget'
import { PrDetailView } from './pr-detail-view'
import type { Role } from '@/types/roles'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Check, X, Circle } from 'lucide-react'

export type FilterOption = 'all' | 'needs_review' | 'changes_requested' | 'ready_to_merge'

interface PrStatusCardProps {
  prs: PullRequestRow[]
  role: Role
}

export function formatAge(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const hours = Math.floor(diff / (1000 * 60 * 60))
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}d ago`
  const weeks = Math.floor(days / 7)
  return `${weeks}w ago`
}

/** Filter PRs by review status filter option. */
export function filterPrsByStatus(prs: PullRequestRow[], filter: FilterOption): PullRequestRow[] {
  if (filter === 'all') return prs
  if (filter === 'needs_review') return prs.filter((pr) => pr.reviewStatus === 'pending')
  if (filter === 'changes_requested') return prs.filter((pr) => pr.reviewStatus === 'changes_requested')
  if (filter === 'ready_to_merge') return prs.filter((pr) => pr.reviewStatus === 'approved')
  return prs
}

/** Aggregate PR counts for the stakeholder summary view. */
export function getStakeholderSummary(prs: PullRequestRow[]): { openCount: number; mergedThisWeek: number } {
  const oneWeekAgo = new Date()
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)
  const openCount = prs.filter((pr) => pr.state === 'open').length
  const mergedThisWeek = prs.filter((pr) => {
    if (!pr.mergedAt) return false
    return new Date(pr.mergedAt) >= oneWeekAgo
  }).length
  return { openCount, mergedThisWeek }
}

/** Build the breadcrumb label string for a PR detail view. */
export function buildPrBreadcrumb(repoFullName: string, prNumber: number, title: string): string {
  return `Dashboard > Pull Requests > ${repoFullName}#${prNumber} (${title})`
}

/** Extract review status from GitHub PR raw_payload. Defaults to 'pending'. */
export function extractReviewStatus(
  rawPayload: Record<string, unknown>
): PullRequestRow['reviewStatus'] {
  const status = rawPayload?.review_status
  if (status === 'approved') return 'approved'
  if (status === 'changes_requested') return 'changes_requested'
  return 'pending'
}

/** Extract CI status from GitHub PR raw_payload. Returns null when not present. */
export function extractCiStatus(
  rawPayload: Record<string, unknown>
): PullRequestRow['ciStatus'] {
  const status = rawPayload?.ci_status
  if (status === 'success') return 'success'
  if (status === 'failure') return 'failure'
  if (status === 'pending') return 'pending'
  return null
}

function ReviewStatusBadge({ status }: { status: PullRequestRow['reviewStatus'] }) {
  const config: Record<PullRequestRow['reviewStatus'], { label: string; className: string }> = {
    approved: { label: 'Approved', className: 'bg-emerald-50 text-coriander border-0' },
    changes_requested: { label: 'Changes', className: 'bg-destructive/10 text-chili border-0' },
    pending: { label: 'Review', className: 'bg-amber-50 text-turmeric border-0' },
  }
  const { label, className } = config[status]
  return (
    <Badge className={cn('text-[0.6875rem] font-medium rounded-full px-1.5 py-0.5 whitespace-nowrap', className)}>
      {label}
    </Badge>
  )
}

function CiStatusIcon({ status }: { status: PullRequestRow['ciStatus'] }) {
  if (status === 'success')
    return <Check className="h-3.5 w-3.5 text-coriander" aria-label="CI passed" />
  if (status === 'failure')
    return <X className="h-3.5 w-3.5 text-chili" aria-label="CI failed" />
  if (status === 'pending')
    return <Circle className="h-3.5 w-3.5 text-turmeric" aria-label="CI running" />
  return null
}

/**
 * PrStatusCard — Client Component with filter row and PR list.
 * Handles filter state and drill-down to PrDetailView.
 * Stakeholder view: aggregated summary only, no code links, no author details.
 */
export function PrStatusCard({ prs, role }: PrStatusCardProps) {
  const [filter, setFilter] = useState<FilterOption>('all')
  const [selectedPr, setSelectedPr] = useState<PullRequestRow | null>(null)

  const isStakeholder = role === 'stakeholder'

  const filters: { key: FilterOption; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'needs_review', label: 'Needs Review' },
    { key: 'changes_requested', label: 'Changes Requested' },
    { key: 'ready_to_merge', label: 'Ready to Merge' },
  ]

  const filteredPrs = filterPrsByStatus(prs, filter)
  const summary = getStakeholderSummary(prs)

  return (
    <>
      {/* Stakeholder aggregated summary */}
      {isStakeholder && (
        <div className="mb-3 py-2 px-3 bg-muted/50 rounded-[var(--radius-sm)] border border-border">
          <p className="m-0 text-[0.8125rem] text-muted-foreground">
            <span className="font-semibold text-foreground">{summary.openCount}</span>
            {' '}PRs open
            {' · '}
            <span className="font-semibold text-foreground">{summary.mergedThisWeek}</span>
            {' '}merged this week
          </p>
        </div>
      )}

      {/* Filter row */}
      <div
        className="flex gap-2 mb-3 flex-wrap flex-shrink-0"
        role="group"
        aria-label="Filter pull requests"
      >
        {filters.map(({ key, label }) => (
          <Button
            key={key}
            variant="outline"
            size="sm"
            onClick={() => setFilter(key)}
            aria-pressed={filter === key}
            className={cn(
              'text-xs rounded-full px-3 py-1 h-auto whitespace-nowrap',
              filter === key
                ? 'border-turmeric bg-muted font-semibold text-foreground'
                : 'border-border bg-transparent font-normal text-muted-foreground'
            )}
          >
            {label}
          </Button>
        ))}
      </div>

      {/* PR list */}
      <div className="flex-1 overflow-y-auto flex flex-col gap-2">
        {filteredPrs.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center p-4 m-0">
            No PRs match this filter.
          </p>
        ) : (
          filteredPrs.map((pr) => (
            <button
              key={pr.id}
              onClick={() => !isStakeholder && setSelectedPr(pr)}
              className={cn(
                'block w-full text-left py-2 px-3',
                'bg-muted/50 border border-border rounded-[var(--radius-sm)]',
                isStakeholder ? 'cursor-default' : 'cursor-pointer transition-colors hover:bg-muted',
                pr.isStale && 'border-turmeric',
                pr.reviewStatus === 'changes_requested' && 'border-l-[3px] border-l-turmeric'
              )}
              aria-label={`PR #${pr.prNumber}: ${pr.title}`}
            >
              {/* Row 1: repo · PR number · title · stale badge · age */}
              <div className="flex items-baseline gap-2 flex-wrap">
                <span className="text-[0.6875rem] text-muted-foreground flex-shrink-0">
                  {pr.repoName}
                </span>
                <span className="text-[0.6875rem] font-semibold text-muted-foreground flex-shrink-0">
                  #{pr.prNumber}
                </span>
                <span className="text-[0.8125rem] font-medium text-foreground overflow-hidden text-ellipsis whitespace-nowrap flex-1 min-w-0">
                  {pr.title}
                </span>
                {pr.isStale && (
                  <Badge
                    title="No review activity in over 3 days"
                    className="text-[0.6875rem] font-medium rounded-full px-1.5 py-0 whitespace-nowrap flex-shrink-0 bg-amber-50 text-turmeric border-0"
                  >
                    Stale
                  </Badge>
                )}
                <span className="text-[0.6875rem] text-muted-foreground flex-shrink-0">
                  {formatAge(pr.updatedAt)}
                </span>
              </div>

              {/* Row 2: author · review status · draft · CI status (not for stakeholder) */}
              {!isStakeholder && (
                <div className="flex items-center gap-2 mt-1">
                  {pr.author && (
                    <span className="text-[0.6875rem] text-muted-foreground">
                      {pr.author}
                    </span>
                  )}
                  <ReviewStatusBadge status={pr.reviewStatus} />
                  {pr.isDraft && (
                    <Badge
                      variant="outline"
                      className="text-[0.6875rem] rounded-full px-1.5 py-0 border-border text-muted-foreground"
                    >
                      Draft
                    </Badge>
                  )}
                  <CiStatusIcon status={pr.ciStatus} />
                </div>
              )}
            </button>
          ))
        )}
      </div>

      {/* Drill-down detail overlay */}
      {selectedPr && (
        <PrDetailView pr={selectedPr} onClose={() => setSelectedPr(null)} />
      )}
    </>
  )
}
