'use client'

import { useEffect, useState } from 'react'
import type { ProjectProgress } from './sprint-progress-widget'

interface SprintIssue {
  issue_key: string
  summary: string
  status: string
  assignee_email: string | null
  story_points: number | null
  priority: string | null
}

interface SprintDetailViewProps {
  project: ProjectProgress
  onClose: () => void
}

const STATUS_COLUMNS = ['To Do', 'In Progress', 'In Review', 'Done'] as const

function getStatusColor(status: string): string {
  switch (status) {
    case 'Done':
    case 'Closed':
      return 'var(--color-coriander)'
    case 'In Progress':
      return 'var(--color-turmeric)'
    case 'Blocked':
      return 'var(--color-chili)'
    default:
      return 'var(--color-text-muted)'
  }
}

function isBlocker(issue: SprintIssue): boolean {
  return issue.status === 'Blocked' || issue.priority === 'Critical' || issue.priority === 'Highest'
}

/**
 * SprintDetailView — slide-in panel showing issues grouped by status.
 * Fetches issue data from the API on open.
 */
export function SprintDetailView({ project, onClose }: SprintDetailViewProps) {
  const [issues, setIssues] = useState<SprintIssue[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Close on Escape key
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [onClose])

  useEffect(() => {
    async function fetchIssues() {
      try {
        setLoading(true)
        const res = await fetch(
          `/api/jira/sprint-issues?projectKey=${encodeURIComponent(project.projectKey)}`
        )
        if (res.ok) {
          const json = await res.json() as { data: SprintIssue[] }
          setIssues(json.data ?? [])
        }
      } catch {
        // Silently handle fetch errors — show empty state
      } finally {
        setLoading(false)
      }
    }
    void fetchIssues()
  }, [project.projectKey])

  // Group issues by status column
  const grouped = STATUS_COLUMNS.reduce<Record<string, SprintIssue[]>>((acc, col) => {
    acc[col] = issues.filter((i) => {
      if (col === 'Done') return i.status === 'Done' || i.status === 'Closed'
      return i.status === col
    })
    return acc
  }, {})

  const unmatched = issues.filter(
    (i) => !STATUS_COLUMNS.some((col) => {
      if (col === 'Done') return i.status === 'Done' || i.status === 'Closed'
      return i.status === col
    })
  )
  if (unmatched.length > 0) {
    grouped['Other'] = unmatched
  }

  return (
    <div
      style={{ position: 'fixed', inset: 0, zIndex: 40, display: 'flex' }}
    >
      {/* Backdrop */}
      <div
        style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.3)' }}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label={`Sprint detail: ${project.projectKey}`}
        style={{
          width: '480px',
          maxWidth: '95vw',
          backgroundColor: 'white',
          boxShadow: 'var(--shadow-lg)',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: 'var(--space-5)',
            borderBottom: '1px solid var(--color-border)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            gap: 'var(--space-3)',
            flexShrink: 0,
          }}
        >
          <div>
            <p style={{ margin: '0 0 4px', fontSize: '0.6875rem', color: 'var(--color-text-muted)' }}>
              Sprint Progress › {project.projectKey}
            </p>
            <h2 style={{ margin: 0, fontSize: '1rem', fontWeight: 600, lineHeight: 1.4 }}>
              {project.projectName}
            </h2>
            <p style={{ margin: '2px 0 0', fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>
              {project.sprintName} · {project.completedIssues}/{project.totalIssues} done
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close sprint detail"
            style={{
              flexShrink: 0,
              padding: '4px 8px',
              backgroundColor: 'transparent',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-sm)',
              cursor: 'pointer',
              fontSize: '1rem',
              lineHeight: 1,
            }}
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: 'var(--space-4)', flex: 1 }}>
          {loading ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '120px' }}>
              <span style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
                Loading issues…
              </span>
            </div>
          ) : issues.length === 0 ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '120px' }}>
              <span style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
                No issues found for this sprint
              </span>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
              {[...STATUS_COLUMNS, 'Other'].map((col) => {
                const colIssues = grouped[col]
                if (!colIssues || colIssues.length === 0) return null
                return (
                  <div key={col}>
                    <h3
                      style={{
                        margin: '0 0 var(--space-2)',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        color: 'var(--color-text-muted)',
                      }}
                    >
                      {col} ({colIssues.length})
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                      {colIssues.map((issue) => (
                        <div
                          key={issue.issue_key}
                          style={{
                            padding: 'var(--space-2) var(--space-3) var(--space-2) var(--space-4)',
                            borderLeft: `4px solid ${isBlocker(issue) ? 'var(--color-chili)' : 'var(--color-border)'}`,
                            backgroundColor: 'var(--color-surface)',
                            border: '1px solid var(--color-border)',
                            borderLeftWidth: '4px',
                            borderLeftColor: isBlocker(issue) ? 'var(--color-chili)' : 'var(--color-border)',
                            borderRadius: '0 var(--radius-sm) var(--radius-sm) 0',
                          }}
                        >
                          <div
                            style={{
                              display: 'flex',
                              alignItems: 'flex-start',
                              justifyContent: 'space-between',
                              gap: 'var(--space-2)',
                            }}
                          >
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <span
                                style={{
                                  fontSize: '0.6875rem',
                                  fontWeight: 600,
                                  color: 'var(--color-text-muted)',
                                }}
                              >
                                {issue.issue_key}
                              </span>
                              <p
                                style={{
                                  margin: '2px 0 0',
                                  fontSize: '0.8125rem',
                                  color: 'var(--color-text)',
                                  fontWeight: 500,
                                  lineHeight: 1.4,
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  display: '-webkit-box',
                                  WebkitLineClamp: 2,
                                  WebkitBoxOrient: 'vertical',
                                }}
                              >
                                {issue.summary}
                              </p>
                            </div>
                            {issue.story_points !== null && (
                              <span
                                style={{
                                  flexShrink: 0,
                                  fontSize: '0.75rem',
                                  fontWeight: 600,
                                  color: 'var(--color-text-muted)',
                                  backgroundColor: 'var(--color-border-subtle)',
                                  padding: '2px 6px',
                                  borderRadius: '999px',
                                }}
                              >
                                {issue.story_points}
                              </span>
                            )}
                          </div>
                          <div
                            style={{
                              display: 'flex',
                              gap: 'var(--space-3)',
                              marginTop: '4px',
                              alignItems: 'center',
                            }}
                          >
                            <span
                              style={{
                                fontSize: '0.6875rem',
                                color: getStatusColor(issue.status),
                                fontWeight: 500,
                              }}
                            >
                              {issue.status}
                            </span>
                            {issue.assignee_email && (
                              <span style={{ fontSize: '0.6875rem', color: 'var(--color-text-muted)' }}>
                                {issue.assignee_email.split('@')[0]}
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
