'use client'

import { useState } from 'react'
import type { WorkflowRunRow, CommitActivityRow } from './cicd-status-widget'
import { CommitActivityChart } from './commit-activity-chart'

interface CicdStatusCardProps {
  runs: WorkflowRunRow[]
  activity: CommitActivityRow[]
}

// ---- Pure utility functions (exported for testing) ---------------------

/** Format a duration in seconds to a human-readable string. */
export function formatDuration(seconds: number | null): string {
  if (seconds === null) return '–'
  if (seconds < 60) return `${seconds}s`
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  if (mins < 60) return `${mins}m ${secs}s`
  const hours = Math.floor(mins / 60)
  const remainingMins = mins % 60
  return `${hours}h ${remainingMins}m`
}

export interface RunStatusConfig {
  label: string
  colorVar: string
  symbol: string
}

/** Map a workflow run status + conclusion to display config. */
export function getRunStatusConfig(
  status: string,
  conclusion: string | null
): RunStatusConfig {
  if (status === 'in_progress') {
    return { label: 'Running', colorVar: 'var(--color-turmeric)', symbol: '◎' }
  }
  if (status === 'queued') {
    return { label: 'Queued', colorVar: 'var(--color-turmeric)', symbol: '○' }
  }
  if (status === 'completed') {
    if (conclusion === 'success') {
      return { label: 'Success', colorVar: 'var(--color-coriander)', symbol: '✓' }
    }
    if (conclusion === 'failure' || conclusion === 'timed_out') {
      return { label: 'Failed', colorVar: 'var(--color-chili)', symbol: '✗' }
    }
    if (conclusion === 'cancelled') {
      return { label: 'Cancelled', colorVar: 'var(--color-text-muted)', symbol: '⊘' }
    }
    if (conclusion === 'skipped') {
      return { label: 'Skipped', colorVar: 'var(--color-text-muted)', symbol: '⤳' }
    }
  }
  return { label: 'Unknown', colorVar: 'var(--color-text-muted)', symbol: '?' }
}

/** Aggregate pass/fail/running counts for runs from the last 24 hours. */
export function getSummary24h(
  runs: WorkflowRunRow[]
): { passed: number; failed: number; running: number } {
  const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000)
  const recent = runs.filter((r) => new Date(r.createdAt) >= cutoff)
  return {
    passed: recent.filter((r) => r.conclusion === 'success').length,
    failed: recent.filter(
      (r) => r.conclusion === 'failure' || r.conclusion === 'timed_out'
    ).length,
    running: recent.filter((r) => r.status === 'in_progress').length,
  }
}

/**
 * Returns true when the given workflow has 3+ consecutive failures
 * at the top of the sorted run list (most recent first by runNumber).
 */
export function isRecurringFailure(workflowName: string, runs: WorkflowRunRow[]): boolean {
  const workflowRuns = [...runs]
    .filter((r) => r.workflowName === workflowName)
    .sort((a, b) => (b.runNumber ?? 0) - (a.runNumber ?? 0))

  let consecutive = 0
  for (const run of workflowRuns) {
    if (run.conclusion === 'failure' || run.conclusion === 'timed_out') {
      consecutive++
      if (consecutive >= 3) return true
    } else if (run.status === 'completed') {
      // A non-failure completed run breaks the streak
      break
    }
    // in_progress/queued don't break the streak
  }
  return false
}

/** Sum commit counts for the last 7 days from activity rows. */
export function getCommitCountThisWeek(activity: CommitActivityRow[]): number {
  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
  return activity
    .filter((a) => new Date(a.commitDate) >= sevenDaysAgo)
    .reduce((sum, a) => sum + a.commitCount, 0)
}

/** Build N days of chart data (oldest first), filling zeros for missing days. */
export function buildCommitChartData(
  activity: CommitActivityRow[],
  days: number
): { date: string; count: number }[] {
  const activityMap = new Map(activity.map((a) => [a.commitDate, a.commitCount]))
  const result: { date: string; count: number }[] = []
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    const dateStr = d.toISOString().slice(0, 10)
    result.push({ date: dateStr, count: activityMap.get(dateStr) ?? 0 })
  }
  return result
}

// ---- Sub-components ----------------------------------------------------

function RunStatusIcon({ status, conclusion }: { status: string; conclusion: string | null }) {
  const config = getRunStatusConfig(status, conclusion)
  return (
    <span
      title={config.label}
      aria-label={config.label}
      style={{
        color: config.colorVar,
        fontSize: '0.875rem',
        fontWeight: 600,
        flexShrink: 0,
        lineHeight: 1,
      }}
    >
      {config.symbol}
    </span>
  )
}

// ---- Main component ----------------------------------------------------

/**
 * CicdStatusCard — Client Component.
 * Renders workflow run list with failure drill-down and commit activity chart.
 */
export function CicdStatusCard({ runs, activity }: CicdStatusCardProps) {
  const [expandedRunId, setExpandedRunId] = useState<string | null>(null)

  const summary = getSummary24h(runs)
  const commitCount = getCommitCountThisWeek(activity)
  const chartData = buildCommitChartData(activity, 14)

  // Deduplicate: keep only the most recent run per workflow
  const latestByWorkflow = new Map<string, WorkflowRunRow>()
  for (const run of runs) {
    const existing = latestByWorkflow.get(run.workflowName)
    if (!existing || (run.runNumber ?? 0) > (existing.runNumber ?? 0)) {
      latestByWorkflow.set(run.workflowName, run)
    }
  }
  const latestRuns = Array.from(latestByWorkflow.values())

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: 'var(--space-3)' }}>
      {/* Summary row */}
      <div
        style={{
          display: 'flex',
          gap: 'var(--space-4)',
          padding: 'var(--space-2) var(--space-3)',
          backgroundColor: 'var(--color-surface)',
          borderRadius: 'var(--radius-sm)',
          border: '1px solid var(--color-border)',
          flexShrink: 0,
        }}
        role="status"
        aria-label="CI/CD summary for last 24 hours"
      >
        <span style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)' }}>
          Last 24h:
        </span>
        <span style={{ fontSize: '0.8125rem', color: 'var(--color-coriander)', fontWeight: 600 }}>
          {summary.passed} passed
        </span>
        <span style={{ fontSize: '0.8125rem', color: 'var(--color-chili)', fontWeight: 600 }}>
          {summary.failed} failed
        </span>
        <span style={{ fontSize: '0.8125rem', color: 'var(--color-turmeric)', fontWeight: 600 }}>
          {summary.running} running
        </span>
      </div>

      {/* Workflow run list */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--space-2)',
          minHeight: 0,
        }}
      >
        {latestRuns.map((run) => {
          const recurring = isRecurringFailure(run.workflowName, runs)
          const isFailed = run.conclusion === 'failure' || run.conclusion === 'timed_out'
          const isExpanded = expandedRunId === run.id

          return (
            <div key={run.id}>
              <button
                onClick={() => setExpandedRunId(isExpanded ? null : run.id)}
                style={{
                  display: 'block',
                  width: '100%',
                  textAlign: 'left',
                  padding: 'var(--space-2) var(--space-3)',
                  backgroundColor: 'var(--color-surface)',
                  border: `1px solid ${isFailed ? 'var(--color-chili)' : 'var(--color-border)'}`,
                  borderLeft: isFailed
                    ? '3px solid var(--color-chili)'
                    : '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-sm)',
                  cursor: 'pointer',
                }}
                aria-label={`Workflow ${run.workflowName}: ${getRunStatusConfig(run.status, run.conclusion).label}`}
                aria-expanded={isExpanded}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--space-2)',
                    flexWrap: 'wrap',
                  }}
                >
                  <RunStatusIcon status={run.status} conclusion={run.conclusion} />

                  <span
                    style={{
                      fontSize: '0.8125rem',
                      fontWeight: 500,
                      color: 'var(--color-text)',
                      flex: 1,
                      minWidth: 0,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {run.workflowName}
                  </span>

                  {recurring && (
                    <span
                      style={{
                        fontSize: '0.6875rem',
                        fontWeight: 500,
                        padding: '0.125rem 0.375rem',
                        borderRadius: 'var(--radius-full)',
                        backgroundColor: '#FDECEA',
                        color: 'var(--color-chili)',
                        whiteSpace: 'nowrap',
                        flexShrink: 0,
                      }}
                    >
                      Recurring Failure
                    </span>
                  )}

                  {run.headBranch && (
                    <span
                      style={{
                        fontSize: '0.6875rem',
                        color: 'var(--color-text-muted)',
                        fontFamily: 'monospace',
                        flexShrink: 0,
                      }}
                    >
                      {run.headBranch}
                    </span>
                  )}

                  <span style={{ fontSize: '0.6875rem', color: 'var(--color-text-muted)', flexShrink: 0 }}>
                    {formatDuration(run.durationSeconds)}
                  </span>
                </div>
              </button>

              {/* Expanded detail panel */}
              {isExpanded && (
                <div
                  style={{
                    padding: 'var(--space-3)',
                    backgroundColor: 'var(--color-surface)',
                    borderLeft: '3px solid var(--color-border)',
                    borderRadius: '0 0 var(--radius-sm) var(--radius-sm)',
                    marginTop: '-1px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 'var(--space-2)',
                  }}
                >
                  <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)' }}>
                    <span style={{ fontWeight: 600 }}>Workflow:</span> {run.workflowName}
                  </div>
                  {run.headBranch && (
                    <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)' }}>
                      <span style={{ fontWeight: 600 }}>Branch:</span> {run.headBranch}
                    </div>
                  )}
                  {run.event && (
                    <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)' }}>
                      <span style={{ fontWeight: 600 }}>Trigger:</span> {run.event}
                    </div>
                  )}
                  <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)' }}>
                    <span style={{ fontWeight: 600 }}>Duration:</span> {formatDuration(run.durationSeconds)}
                  </div>
                  {run.htmlUrl && (
                    <a
                      href={run.htmlUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        fontSize: '0.8125rem',
                        color: 'var(--color-turmeric)',
                        textDecoration: 'underline',
                        alignSelf: 'flex-start',
                      }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      Open in GitHub Actions →
                    </a>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Commit activity chart */}
      <div style={{ flexShrink: 0 }}>
        <CommitActivityChart data={chartData} weekCount={commitCount} />
      </div>
    </div>
  )
}
