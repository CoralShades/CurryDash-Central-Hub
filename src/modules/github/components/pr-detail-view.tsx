'use client'

import { useEffect, useCallback } from 'react'
import type { PullRequestRow } from './pr-status-widget'

interface PrDetailViewProps {
  pr: PullRequestRow
  onClose: () => void
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-AU', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

function ReviewStatusText({ status }: { status: PullRequestRow['reviewStatus'] }) {
  const config = {
    approved: { label: 'Approved', color: 'var(--color-coriander)' },
    changes_requested: { label: 'Changes Requested', color: 'var(--color-chili)' },
    pending: { label: 'Pending Review', color: 'var(--color-turmeric)' },
  }
  const { label, color } = config[status]
  return <span style={{ color, fontWeight: 500 }}>{label}</span>
}

function CiStatusText({ status }: { status: 'success' | 'failure' | 'pending' }) {
  const config = {
    success: { label: 'Passing', color: 'var(--color-coriander)' },
    failure: { label: 'Failing', color: 'var(--color-chili)' },
    pending: { label: 'Running', color: 'var(--color-turmeric)' },
  }
  const { label, color } = config[status]
  return <span style={{ color, fontWeight: 500 }}>{label}</span>
}

/**
 * PrDetailView — slide-in panel showing PR details.
 * Shows author, branches, stats, review/CI status, open-in-GitHub and copy link.
 * Closes on Escape key or backdrop click.
 */
export function PrDetailView({ pr, onClose }: PrDetailViewProps) {
  const handleClose = useCallback(() => onClose(), [onClose])

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') handleClose()
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [handleClose])

  return (
    <>
      {/* Backdrop */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0,0,0,0.35)',
          zIndex: 40,
        }}
        onClick={handleClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <div
        role="dialog"
        aria-modal={true}
        aria-label={`PR #${pr.prNumber}: ${pr.title}`}
        style={{
          position: 'fixed',
          right: 0,
          top: 0,
          bottom: 0,
          width: '480px',
          maxWidth: '100vw',
          backgroundColor: 'var(--color-surface)',
          borderLeft: '1px solid var(--color-border)',
          zIndex: 50,
          overflowY: 'auto',
          padding: 'var(--space-5)',
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--space-4)',
        }}
      >
        {/* Breadcrumbs */}
        <nav aria-label="Breadcrumb">
          <ol
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.25rem',
              listStyle: 'none',
              margin: 0,
              padding: 0,
              fontSize: '0.6875rem',
              color: 'var(--color-text-muted)',
              flexWrap: 'wrap',
            }}
          >
            <li>Dashboard</li>
            <li aria-hidden="true">›</li>
            <li>Pull Requests</li>
            <li aria-hidden="true">›</li>
            <li
              style={{ color: 'var(--color-text)', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '200px' }}
              title={`${pr.repoFullName}#${pr.prNumber} (${pr.title})`}
            >
              {pr.repoFullName}#{pr.prNumber}
            </li>
          </ol>
        </nav>

        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            gap: 'var(--space-3)',
          }}
        >
          <div>
            <p style={{ margin: '0 0 var(--space-1)', fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
              {pr.repoFullName} · #{pr.prNumber}
            </p>
            <h2
              style={{
                margin: 0,
                fontSize: '1rem',
                fontWeight: 600,
                color: 'var(--color-text)',
                lineHeight: 1.4,
              }}
            >
              {pr.title}
            </h2>
          </div>
          <button
            onClick={handleClose}
            aria-label="Close PR details"
            style={{
              padding: '0.25rem 0.5rem',
              background: 'transparent',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-sm)',
              cursor: 'pointer',
              fontSize: '0.875rem',
              color: 'var(--color-text-muted)',
              flexShrink: 0,
            }}
          >
            ✕
          </button>
        </div>

        {/* Metadata grid */}
        <dl
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 'var(--space-3)',
            margin: 0,
          }}
        >
          {pr.author && (
            <>
              <dt
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  color: 'var(--color-text-secondary)',
                  margin: 0,
                }}
              >
                Author
              </dt>
              <dd style={{ fontSize: '0.8125rem', color: 'var(--color-text)', margin: 0 }}>
                {pr.author}
              </dd>
            </>
          )}
          <dt
            style={{
              fontSize: '0.75rem',
              fontWeight: 600,
              color: 'var(--color-text-secondary)',
              margin: 0,
            }}
          >
            Branches
          </dt>
          <dd
            style={{
              fontSize: '0.8125rem',
              color: 'var(--color-text)',
              margin: 0,
              fontFamily: 'monospace',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {pr.headBranch} → {pr.baseBranch}
          </dd>
          <dt
            style={{
              fontSize: '0.75rem',
              fontWeight: 600,
              color: 'var(--color-text-secondary)',
              margin: 0,
            }}
          >
            Opened
          </dt>
          <dd style={{ fontSize: '0.8125rem', color: 'var(--color-text)', margin: 0 }}>
            {formatDate(pr.createdAt)}
          </dd>
          <dt
            style={{
              fontSize: '0.75rem',
              fontWeight: 600,
              color: 'var(--color-text-secondary)',
              margin: 0,
            }}
          >
            Review
          </dt>
          <dd style={{ fontSize: '0.8125rem', margin: 0 }}>
            <ReviewStatusText status={pr.reviewStatus} />
          </dd>
          {pr.ciStatus && (
            <>
              <dt
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  color: 'var(--color-text-secondary)',
                  margin: 0,
                }}
              >
                CI Status
              </dt>
              <dd style={{ fontSize: '0.8125rem', margin: 0 }}>
                <CiStatusText status={pr.ciStatus} />
              </dd>
            </>
          )}
        </dl>

        {/* Lines changed */}
        {(pr.additions > 0 || pr.deletions > 0) && (
          <div>
            <p
              style={{
                margin: '0 0 var(--space-2)',
                fontSize: '0.75rem',
                fontWeight: 600,
                color: 'var(--color-text-secondary)',
              }}
            >
              Changes
            </p>
            <div style={{ display: 'flex', gap: 'var(--space-4)', alignItems: 'center' }}>
              <span style={{ fontSize: '0.875rem', color: 'var(--color-coriander)', fontWeight: 500 }}>
                +{pr.additions}
              </span>
              <span style={{ fontSize: '0.875rem', color: 'var(--color-chili)', fontWeight: 500 }}>
                −{pr.deletions}
              </span>
              {pr.changedFiles > 0 && (
                <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                  {pr.changedFiles} file{pr.changedFiles !== 1 ? 's' : ''}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Badges */}
        <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
          {pr.isDraft && (
            <span
              style={{
                fontSize: '0.75rem',
                padding: '0.25rem 0.625rem',
                borderRadius: 'var(--radius-full)',
                border: '1px solid var(--color-border)',
                color: 'var(--color-text-muted)',
              }}
            >
              Draft
            </span>
          )}
          {pr.isStale && (
            <span
              style={{
                fontSize: '0.75rem',
                padding: '0.25rem 0.625rem',
                borderRadius: 'var(--radius-full)',
                backgroundColor: 'var(--color-turmeric-muted, hsl(var(--muted)))',
                color: 'var(--color-turmeric)',
                fontWeight: 500,
              }}
            >
              Stale · No review activity in 3+ days
            </span>
          )}
        </div>

        {/* Action buttons */}
        {pr.htmlUrl && (
          <div style={{ display: 'flex', gap: 'var(--space-2)', marginTop: 'auto' }}>
            <a
              href={pr.htmlUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.375rem',
                padding: '0.5rem 1rem',
                backgroundColor: 'var(--color-turmeric)',
                color: 'white',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.875rem',
                fontWeight: 500,
                textDecoration: 'none',
              }}
            >
              Open in GitHub ↗
            </a>
            <button
              onClick={() => navigator.clipboard.writeText(pr.htmlUrl!)}
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: 'transparent',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.875rem',
                color: 'var(--color-text)',
                cursor: 'pointer',
              }}
            >
              Copy link
            </button>
          </div>
        )}
      </div>
    </>
  )
}
