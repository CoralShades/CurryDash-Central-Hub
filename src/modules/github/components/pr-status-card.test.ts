import { describe, it, expect } from 'vitest'
import { formatAge } from './pr-status-card'

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
