'use client'

import { useState } from 'react'
import type { PullRequestRow } from './pr-status-widget'
import { PrDetailView } from './pr-detail-view'
import type { Role } from '@/types/roles'

type FilterOption = 'all' | 'needs_review' | 'changes_requested' | 'ready_to_merge'

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

function ReviewStatusBadge({ status }: { status: PullRequestRow['reviewStatus'] }) {
  const config: Record<PullRequestRow['reviewStatus'], { label: string; color: string; bg: string }> = {
    approved: { label: 'Approved', color: 'var(--color-coriander)', bg: '#E8F5E9' },
    changes_requested: { label: 'Changes', color: 'var(--color-chili)', bg: '#FDECEA' },
    pending: { label: 'Review', color: 'var(--color-turmeric)', bg: '#FFF8E1' },
  }
  const { label, color, bg } = config[status]
  return (
    <span
      style={{
        fontSize: '0.6875rem',
        fontWeight: 500,
        padding: '0.125rem 0.375rem',
        borderRadius: 'var(--radius-full)',
        backgroundColor: bg,
        color,
        whiteSpace: 'nowrap',
      }}
    >
      {label}
    </span>
  )
}

function CiStatusIcon({ status }: { status: PullRequestRow['ciStatus'] }) {
  if (status === 'success')
    return (
      <span title="CI passed" aria-label="CI passed" style={{ color: 'var(--color-coriander)', fontSize: '0.875rem' }}>
        ✓
      </span>
    )
  if (status === 'failure')
    return (
      <span title="CI failed" aria-label="CI failed" style={{ color: 'var(--color-chili)', fontSize: '0.875rem' }}>
        ✗
      </span>
    )
  if (status === 'pending')
    return (
      <span title="CI running" aria-label="CI running" style={{ color: 'var(--color-turmeric)', fontSize: '0.875rem' }}>
        ◎
      </span>
    )
  return null
}

/**
 * PrStatusCard — Client Component with filter row and PR list.
 * Handles filter state and drill-down to PrDetailView.
 * Stakeholder view: titles only, no code links, no author details.
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

  const filteredPrs = prs.filter((pr) => {
    if (filter === 'all') return true
    if (filter === 'needs_review') return pr.reviewStatus === 'pending'
    if (filter === 'changes_requested') return pr.reviewStatus === 'changes_requested'
    if (filter === 'ready_to_merge') return pr.reviewStatus === 'approved'
    return true
  })

  return (
    <>
      {/* Filter row */}
      <div
        style={{
          display: 'flex',
          gap: 'var(--space-2)',
          marginBottom: 'var(--space-3)',
          flexWrap: 'wrap',
          flexShrink: 0,
        }}
        role="group"
        aria-label="Filter pull requests"
      >
        {filters.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            aria-pressed={filter === key}
            style={{
              padding: '0.25rem 0.75rem',
              fontSize: '0.75rem',
              fontWeight: filter === key ? 600 : 400,
              borderRadius: 'var(--radius-full)',
              border: `1px solid ${filter === key ? 'var(--color-turmeric)' : 'var(--color-border)'}`,
              backgroundColor: filter === key ? 'hsl(var(--muted))' : 'transparent',
              color: filter === key ? 'var(--color-text)' : 'var(--color-text-muted)',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {/* PR list */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--space-2)',
        }}
      >
        {filteredPrs.length === 0 ? (
          <p
            style={{
              fontSize: '0.875rem',
              color: 'var(--color-text-muted)',
              textAlign: 'center',
              padding: 'var(--space-4)',
              margin: 0,
            }}
          >
            No PRs match this filter.
          </p>
        ) : (
          filteredPrs.map((pr) => (
            <button
              key={pr.id}
              onClick={() => !isStakeholder && setSelectedPr(pr)}
              style={{
                display: 'block',
                width: '100%',
                textAlign: 'left',
                padding: 'var(--space-2) var(--space-3)',
                backgroundColor: 'var(--color-surface)',
                border: `1px solid ${pr.isStale ? 'var(--color-turmeric)' : 'var(--color-border)'}`,
                borderRadius: 'var(--radius-sm)',
                cursor: isStakeholder ? 'default' : 'pointer',
              }}
              aria-label={`PR #${pr.prNumber}: ${pr.title}`}
            >
              {/* Row 1: repo · PR number · title · stale badge · age */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'baseline',
                  gap: 'var(--space-2)',
                  flexWrap: 'wrap',
                }}
              >
                <span style={{ fontSize: '0.6875rem', color: 'var(--color-text-muted)', flexShrink: 0 }}>
                  {pr.repoName}
                </span>
                <span
                  style={{
                    fontSize: '0.6875rem',
                    fontWeight: 600,
                    color: 'var(--color-text-secondary)',
                    flexShrink: 0,
                  }}
                >
                  #{pr.prNumber}
                </span>
                <span
                  style={{
                    fontSize: '0.8125rem',
                    fontWeight: 500,
                    color: 'var(--color-text)',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    flex: 1,
                    minWidth: 0,
                  }}
                >
                  {pr.title}
                </span>
                {pr.isStale && (
                  <span
                    title="No review activity in over 3 days"
                    style={{
                      fontSize: '0.6875rem',
                      fontWeight: 500,
                      padding: '0.0625rem 0.375rem',
                      borderRadius: 'var(--radius-full)',
                      backgroundColor: '#FFF8E1',
                      color: 'var(--color-turmeric)',
                      whiteSpace: 'nowrap',
                      flexShrink: 0,
                    }}
                  >
                    Stale
                  </span>
                )}
                <span style={{ fontSize: '0.6875rem', color: 'var(--color-text-muted)', flexShrink: 0 }}>
                  {formatAge(pr.updatedAt)}
                </span>
              </div>

              {/* Row 2: author · review status · draft · CI status (not for stakeholder) */}
              {!isStakeholder && (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--space-2)',
                    marginTop: 'var(--space-1)',
                  }}
                >
                  {pr.author && (
                    <span style={{ fontSize: '0.6875rem', color: 'var(--color-text-muted)' }}>
                      {pr.author}
                    </span>
                  )}
                  <ReviewStatusBadge status={pr.reviewStatus} />
                  {pr.isDraft && (
                    <span
                      style={{
                        fontSize: '0.6875rem',
                        padding: '0.125rem 0.375rem',
                        borderRadius: 'var(--radius-full)',
                        border: '1px solid var(--color-border)',
                        color: 'var(--color-text-muted)',
                      }}
                    >
                      Draft
                    </span>
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
