import { describe, it, expect } from 'vitest'
import {
  formatDuration,
  getRunStatusConfig,
  getSummary24h,
  isRecurringFailure,
  getCommitCountThisWeek,
  buildCommitChartData,
} from './cicd-status-card'
import type { WorkflowRunRow } from './cicd-status-widget'
import type { CommitActivityRow } from './cicd-status-widget'

// ---- helpers -----------------------------------------------------------

function makeRun(overrides: Partial<WorkflowRunRow> = {}): WorkflowRunRow {
  return {
    id: '1',
    runId: 1,
    workflowName: 'CI',
    headBranch: 'main',
    event: 'push',
    status: 'completed',
    conclusion: 'success',
    htmlUrl: 'https://github.com/org/repo/actions/runs/1',
    runNumber: 1,
    durationSeconds: 120,
    repoFullName: 'org/repo',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides,
  }
}

function makeActivity(date: string, count: number): CommitActivityRow {
  return { id: '1', commitDate: date, commitCount: count, repoFullName: 'org/repo' }
}

// ---- formatDuration ----------------------------------------------------

describe('formatDuration', () => {
  it('shows seconds for durations under 60s', () => {
    expect(formatDuration(45)).toBe('45s')
  })

  it('shows minutes and seconds for 1-60 minute durations', () => {
    expect(formatDuration(135)).toBe('2m 15s')
    expect(formatDuration(60)).toBe('1m 0s')
  })

  it('shows hours and minutes for durations over 60 minutes', () => {
    expect(formatDuration(3900)).toBe('1h 5m')
    expect(formatDuration(7200)).toBe('2h 0m')
  })

  it('returns "0s" for zero duration', () => {
    expect(formatDuration(0)).toBe('0s')
  })

  it('returns "–" for null duration', () => {
    expect(formatDuration(null)).toBe('–')
  })
})

// ---- getRunStatusConfig ------------------------------------------------

describe('getRunStatusConfig', () => {
  it('returns success config for completed + success conclusion', () => {
    const config = getRunStatusConfig('completed', 'success')
    expect(config.label).toBe('Success')
    expect(config.colorVar).toBe('var(--color-coriander)')
  })

  it('returns failure config for completed + failure conclusion', () => {
    const config = getRunStatusConfig('completed', 'failure')
    expect(config.label).toBe('Failed')
    expect(config.colorVar).toBe('var(--color-chili)')
  })

  it('returns in-progress config for in_progress status', () => {
    const config = getRunStatusConfig('in_progress', null)
    expect(config.label).toBe('Running')
    expect(config.colorVar).toBe('var(--color-turmeric)')
  })

  it('returns queued config for queued status', () => {
    const config = getRunStatusConfig('queued', null)
    expect(config.label).toBe('Queued')
    expect(config.colorVar).toBe('var(--color-turmeric)')
  })

  it('returns cancelled config for cancelled conclusion', () => {
    const config = getRunStatusConfig('completed', 'cancelled')
    expect(config.label).toBe('Cancelled')
  })

  it('returns unknown config for unrecognised combinations', () => {
    const config = getRunStatusConfig('unknown_status', null)
    expect(config.label).toBe('Unknown')
  })
})

// ---- getSummary24h -----------------------------------------------------

describe('getSummary24h', () => {
  it('counts passed, failed and running runs from the last 24 hours', () => {
    const now = new Date()
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000).toISOString()
    const runs = [
      makeRun({ conclusion: 'success', createdAt: oneHourAgo }),
      makeRun({ conclusion: 'success', createdAt: oneHourAgo }),
      makeRun({ conclusion: 'failure', createdAt: oneHourAgo }),
      makeRun({ status: 'in_progress', conclusion: null, createdAt: oneHourAgo }),
    ]
    const summary = getSummary24h(runs)
    expect(summary.passed).toBe(2)
    expect(summary.failed).toBe(1)
    expect(summary.running).toBe(1)
  })

  it('excludes runs older than 24 hours', () => {
    const twoDaysAgo = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString()
    const runs = [
      makeRun({ conclusion: 'failure', createdAt: twoDaysAgo }),
      makeRun({ conclusion: 'success', createdAt: oneHourAgo }),
    ]
    const summary = getSummary24h(runs)
    expect(summary.passed).toBe(1)
    expect(summary.failed).toBe(0)
  })

  it('returns zeros for empty array', () => {
    const summary = getSummary24h([])
    expect(summary.passed).toBe(0)
    expect(summary.failed).toBe(0)
    expect(summary.running).toBe(0)
  })
})

// ---- isRecurringFailure ------------------------------------------------

describe('isRecurringFailure', () => {
  it('returns true when the same workflow has 3+ consecutive failures', () => {
    const runs = [
      makeRun({ workflowName: 'CI', conclusion: 'failure', runNumber: 10 }),
      makeRun({ workflowName: 'CI', conclusion: 'failure', runNumber: 9 }),
      makeRun({ workflowName: 'CI', conclusion: 'failure', runNumber: 8 }),
      makeRun({ workflowName: 'CI', conclusion: 'success', runNumber: 7 }),
    ]
    expect(isRecurringFailure('CI', runs)).toBe(true)
  })

  it('returns false when the workflow has fewer than 3 consecutive failures', () => {
    const runs = [
      makeRun({ workflowName: 'CI', conclusion: 'failure', runNumber: 10 }),
      makeRun({ workflowName: 'CI', conclusion: 'failure', runNumber: 9 }),
      makeRun({ workflowName: 'CI', conclusion: 'success', runNumber: 8 }),
    ]
    expect(isRecurringFailure('CI', runs)).toBe(false)
  })

  it('returns false for a workflow with no failures', () => {
    const runs = [
      makeRun({ workflowName: 'CI', conclusion: 'success', runNumber: 5 }),
      makeRun({ workflowName: 'CI', conclusion: 'success', runNumber: 4 }),
    ]
    expect(isRecurringFailure('CI', runs)).toBe(false)
  })

  it('only counts runs for the named workflow', () => {
    const runs = [
      makeRun({ workflowName: 'Deploy', conclusion: 'failure', runNumber: 3 }),
      makeRun({ workflowName: 'Deploy', conclusion: 'failure', runNumber: 2 }),
      makeRun({ workflowName: 'Deploy', conclusion: 'failure', runNumber: 1 }),
    ]
    expect(isRecurringFailure('CI', runs)).toBe(false)
  })

  it('returns false for empty runs array', () => {
    expect(isRecurringFailure('CI', [])).toBe(false)
  })
})

// ---- getCommitCountThisWeek --------------------------------------------

describe('getCommitCountThisWeek', () => {
  it('sums commits from the last 7 days', () => {
    const today = new Date()
    const dates = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(today)
      d.setDate(d.getDate() - i)
      return d.toISOString().slice(0, 10)
    })
    const activity = dates.map((date, i) => makeActivity(date, i + 1))
    // 1+2+3+4+5+6+7 = 28
    expect(getCommitCountThisWeek(activity)).toBe(28)
  })

  it('excludes activity older than 7 days', () => {
    const tenDaysAgo = new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
    const activity = [makeActivity(tenDaysAgo, 100), makeActivity(yesterday, 5)]
    expect(getCommitCountThisWeek(activity)).toBe(5)
  })

  it('returns 0 for empty activity', () => {
    expect(getCommitCountThisWeek([])).toBe(0)
  })
})

// ---- buildCommitChartData ----------------------------------------------

describe('buildCommitChartData', () => {
  it('returns exactly N days of data', () => {
    const data = buildCommitChartData([], 14)
    expect(data).toHaveLength(14)
  })

  it('fills in zero for days with no activity', () => {
    const data = buildCommitChartData([], 7)
    data.forEach((d) => expect(d.count).toBe(0))
  })

  it('fills in commit counts from activity records', () => {
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
    const activity = [makeActivity(yesterday, 12)]
    const data = buildCommitChartData(activity, 7)
    const yesterdayEntry = data.find((d) => d.date === yesterday)
    expect(yesterdayEntry?.count).toBe(12)
  })

  it('returns dates in ascending order (oldest first)', () => {
    const data = buildCommitChartData([], 5)
    for (let i = 1; i < data.length; i++) {
      expect(new Date(data[i].date).getTime()).toBeGreaterThan(new Date(data[i - 1].date).getTime())
    }
  })
})
