'use client'

import { useState } from 'react'
import type { WorkflowRunRow, CommitActivityRow } from './cicd-status-widget'
import { CommitActivityChart } from './commit-activity-chart'
import { Badge } from '@/components/ui/badge'
import { Check, X, Circle, Ban } from 'lucide-react'
import { cn } from '@/lib/utils'

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
  const baseClass = 'h-3.5 w-3.5 flex-shrink-0'

  if (status === 'completed') {
    if (conclusion === 'success') {
      return <Check className={cn(baseClass, 'text-coriander')} aria-label={config.label} />
    }
    if (conclusion === 'failure' || conclusion === 'timed_out') {
      return <X className={cn(baseClass, 'text-chili')} aria-label={config.label} />
    }
    if (conclusion === 'cancelled') {
      return <Ban className={cn(baseClass, 'text-muted-foreground')} aria-label={config.label} />
    }
  }
  // in_progress, queued, skipped, unknown — use Circle with appropriate color
  const colorClass = status === 'in_progress' || status === 'queued'
    ? 'text-turmeric'
    : 'text-muted-foreground'
  return <Circle className={cn(baseClass, colorClass)} aria-label={config.label} />
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
    <div className="flex flex-col h-full gap-3">
      {/* Summary row */}
      <div
        className="flex gap-4 py-2 px-3 bg-muted/50 rounded-[var(--radius-sm)] border border-border flex-shrink-0"
        role="status"
        aria-label="CI/CD summary for last 24 hours"
      >
        <span className="text-[0.8125rem] text-muted-foreground">Last 24h:</span>
        <span className="text-[0.8125rem] text-coriander font-semibold">{summary.passed} passed</span>
        <span className="text-[0.8125rem] text-chili font-semibold">{summary.failed} failed</span>
        <span className="text-[0.8125rem] text-turmeric font-semibold">{summary.running} running</span>
      </div>

      {/* Workflow run list */}
      <div className="flex-1 overflow-y-auto flex flex-col gap-2 min-h-0">
        {latestRuns.map((run) => {
          const recurring = isRecurringFailure(run.workflowName, runs)
          const isFailed = run.conclusion === 'failure' || run.conclusion === 'timed_out'
          const isExpanded = expandedRunId === run.id

          return (
            <div key={run.id}>
              <button
                onClick={() => setExpandedRunId(isExpanded ? null : run.id)}
                className={cn(
                  'block w-full text-left py-2 px-3',
                  'bg-muted/50 border rounded-[var(--radius-sm)] cursor-pointer transition-colors hover:bg-muted',
                  isFailed
                    ? 'border-chili border-l-[3px] border-l-chili'
                    : 'border-border'
                )}
                aria-label={`Workflow ${run.workflowName}: ${getRunStatusConfig(run.status, run.conclusion).label}`}
                aria-expanded={isExpanded}
              >
                <div className="flex items-center gap-2 flex-wrap">
                  <RunStatusIcon status={run.status} conclusion={run.conclusion} />

                  <span className="text-[0.8125rem] font-medium text-foreground flex-1 min-w-0 overflow-hidden text-ellipsis whitespace-nowrap">
                    {run.workflowName}
                  </span>

                  {recurring && (
                    <Badge className="text-[0.6875rem] font-medium rounded-full px-1.5 py-0 whitespace-nowrap flex-shrink-0 bg-destructive/10 text-chili border-0">
                      Recurring Failure
                    </Badge>
                  )}

                  {run.headBranch && (
                    <span className="text-[0.6875rem] text-muted-foreground font-mono flex-shrink-0">
                      {run.headBranch}
                    </span>
                  )}

                  <span className="text-[0.6875rem] text-muted-foreground flex-shrink-0">
                    {formatDuration(run.durationSeconds)}
                  </span>
                </div>
              </button>

              {/* Expanded detail panel */}
              {isExpanded && (
                <div className="p-3 bg-muted/50 border-l-[3px] border-l-border rounded-b-[var(--radius-sm)] -mt-px flex flex-col gap-2">
                  <div className="text-[0.8125rem] text-muted-foreground">
                    <span className="font-semibold">Workflow:</span> {run.workflowName}
                  </div>
                  {run.headBranch && (
                    <div className="text-[0.8125rem] text-muted-foreground">
                      <span className="font-semibold">Branch:</span> {run.headBranch}
                    </div>
                  )}
                  {run.event && (
                    <div className="text-[0.8125rem] text-muted-foreground">
                      <span className="font-semibold">Trigger:</span> {run.event}
                    </div>
                  )}
                  <div className="text-[0.8125rem] text-muted-foreground">
                    <span className="font-semibold">Duration:</span> {formatDuration(run.durationSeconds)}
                  </div>
                  {run.htmlUrl && (
                    <a
                      href={run.htmlUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[0.8125rem] text-turmeric underline self-start"
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
      <div className="flex-shrink-0">
        <CommitActivityChart data={chartData} weekCount={commitCount} />
      </div>
    </div>
  )
}
