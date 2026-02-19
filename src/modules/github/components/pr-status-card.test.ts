import { describe, it, expect } from 'vitest'
import {
  formatAge,
  filterPrsByStatus,
  getStakeholderSummary,
  buildPrBreadcrumb,
  extractReviewStatus,
  extractCiStatus,
} from './pr-status-card'
import type { PullRequestRow } from './pr-status-widget'

// ---- helpers -----------------------------------------------------------

function makePr(overrides: Partial<PullRequestRow> = {}): PullRequestRow {
  return {
    id: '1',
    prNumber: 1,
    title: 'Test PR',
    state: 'open',
    author: 'testuser',
    authorAvatarUrl: null,
    headBranch: 'feature',
    baseBranch: 'main',
    repoFullName: 'org/repo',
    repoName: 'repo',
    htmlUrl: null,
    reviewStatus: 'pending',
    ciStatus: null,
    additions: 0,
    deletions: 0,
    changedFiles: 0,
    isDraft: false,
    mergedAt: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    syncedAt: null,
    isStale: false,
    ...overrides,
  }
}

// ---- formatAge ---------------------------------------------------------

describe('formatAge', () => {
  it('shows hours for recent PRs', () => {
    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
    expect(formatAge(twoHoursAgo)).toBe('2h ago')
  })

  it('shows days for PRs older than 24 hours', () => {
    const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
    expect(formatAge(threeDaysAgo)).toBe('3d ago')
  })

  it('shows weeks for PRs older than 7 days', () => {
    const twoWeeksAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString()
    expect(formatAge(twoWeeksAgo)).toBe('2w ago')
  })

  it('shows 0h for very recent PRs', () => {
    const justNow = new Date(Date.now() - 5 * 60 * 1000).toISOString()
    expect(formatAge(justNow)).toBe('0h ago')
  })

  it('shows 1d for a 25-hour-old PR', () => {
    const twentyFiveHoursAgo = new Date(Date.now() - 25 * 60 * 60 * 1000).toISOString()
    expect(formatAge(twentyFiveHoursAgo)).toBe('1d ago')
  })
})

// ---- filterPrsByStatus -------------------------------------------------

describe('filterPrsByStatus', () => {
  it('returns all PRs for "all" filter', () => {
    const prs = [makePr({ reviewStatus: 'pending' }), makePr({ reviewStatus: 'approved' })]
    expect(filterPrsByStatus(prs, 'all')).toHaveLength(2)
  })

  it('returns only pending PRs for "needs_review" filter', () => {
    const prs = [makePr({ reviewStatus: 'pending' }), makePr({ reviewStatus: 'approved' })]
    const result = filterPrsByStatus(prs, 'needs_review')
    expect(result).toHaveLength(1)
    expect(result[0].reviewStatus).toBe('pending')
  })

  it('returns only changes_requested PRs for "changes_requested" filter', () => {
    const prs = [
      makePr({ reviewStatus: 'changes_requested' }),
      makePr({ reviewStatus: 'approved' }),
      makePr({ reviewStatus: 'pending' }),
    ]
    const result = filterPrsByStatus(prs, 'changes_requested')
    expect(result).toHaveLength(1)
    expect(result[0].reviewStatus).toBe('changes_requested')
  })

  it('returns only approved PRs for "ready_to_merge" filter', () => {
    const prs = [makePr({ reviewStatus: 'approved' }), makePr({ reviewStatus: 'pending' })]
    const result = filterPrsByStatus(prs, 'ready_to_merge')
    expect(result).toHaveLength(1)
    expect(result[0].reviewStatus).toBe('approved')
  })

  it('returns empty array when no PRs match the filter', () => {
    const prs = [makePr({ reviewStatus: 'pending' })]
    expect(filterPrsByStatus(prs, 'ready_to_merge')).toHaveLength(0)
  })
})

// ---- getStakeholderSummary ---------------------------------------------

describe('getStakeholderSummary', () => {
  it('counts open PRs correctly', () => {
    const prs = [
      makePr({ state: 'open' }),
      makePr({ state: 'open' }),
      makePr({ state: 'closed', mergedAt: null }),
    ]
    expect(getStakeholderSummary(prs).openCount).toBe(2)
  })

  it('counts PRs merged within the last 7 days', () => {
    const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
    const tenDaysAgo = new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString()
    const prs = [
      makePr({ state: 'closed', mergedAt: threeDaysAgo }),
      makePr({ state: 'closed', mergedAt: tenDaysAgo }),
      makePr({ state: 'open' }),
    ]
    expect(getStakeholderSummary(prs).mergedThisWeek).toBe(1)
  })

  it('does not count closed-not-merged PRs in mergedThisWeek', () => {
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
    const prs = [makePr({ state: 'closed', mergedAt: null }), makePr({ state: 'closed', mergedAt: yesterday })]
    expect(getStakeholderSummary(prs).mergedThisWeek).toBe(1)
  })

  it('returns zeros for empty array', () => {
    const summary = getStakeholderSummary([])
    expect(summary.openCount).toBe(0)
    expect(summary.mergedThisWeek).toBe(0)
  })
})

// ---- buildPrBreadcrumb -------------------------------------------------

describe('buildPrBreadcrumb', () => {
  it('formats the breadcrumb string correctly', () => {
    expect(buildPrBreadcrumb('org/repo', 123, 'Fix login bug')).toBe(
      'Dashboard > Pull Requests > org/repo#123 (Fix login bug)'
    )
  })

  it('handles repo names with special characters', () => {
    expect(buildPrBreadcrumb('my-org/my-repo', 42, 'feat: add dark mode')).toBe(
      'Dashboard > Pull Requests > my-org/my-repo#42 (feat: add dark mode)'
    )
  })
})

// ---- extractReviewStatus -----------------------------------------------

describe('extractReviewStatus', () => {
  it('returns "pending" for empty payload', () => {
    expect(extractReviewStatus({})).toBe('pending')
  })

  it('returns "approved" when payload has review_status: approved', () => {
    expect(extractReviewStatus({ review_status: 'approved' })).toBe('approved')
  })

  it('returns "changes_requested" when payload has review_status: changes_requested', () => {
    expect(extractReviewStatus({ review_status: 'changes_requested' })).toBe('changes_requested')
  })

  it('returns "pending" for unrecognised review_status values', () => {
    expect(extractReviewStatus({ review_status: 'commented' })).toBe('pending')
    expect(extractReviewStatus({ review_status: 123 })).toBe('pending')
  })
})

// ---- extractCiStatus ---------------------------------------------------

describe('extractCiStatus', () => {
  it('returns null for empty payload', () => {
    expect(extractCiStatus({})).toBeNull()
  })

  it('returns "success" when payload has ci_status: success', () => {
    expect(extractCiStatus({ ci_status: 'success' })).toBe('success')
  })

  it('returns "failure" when payload has ci_status: failure', () => {
    expect(extractCiStatus({ ci_status: 'failure' })).toBe('failure')
  })

  it('returns "pending" when payload has ci_status: pending', () => {
    expect(extractCiStatus({ ci_status: 'pending' })).toBe('pending')
  })

  it('returns null for unrecognised ci_status values', () => {
    expect(extractCiStatus({ ci_status: 'cancelled' })).toBeNull()
    expect(extractCiStatus({ ci_status: 'skipped' })).toBeNull()
  })
})
