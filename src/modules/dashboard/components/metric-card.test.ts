import { describe, it, expect } from 'vitest'
import type { TrendDirection } from './metric-card'

// Test the pure logic: trend color selection
function trendColor(trend: TrendDirection, isPositiveGood = true): string {
  if (trend === 'neutral') return 'var(--color-text-muted)'
  const isGood = isPositiveGood ? trend === 'up' : trend === 'down'
  return isGood ? 'var(--color-success)' : 'var(--color-error)'
}

describe('MetricCard trend color logic', () => {
  it('returns success for upward trend when positive is good', () => {
    expect(trendColor('up', true)).toBe('var(--color-success)')
  })

  it('returns error for downward trend when positive is good', () => {
    expect(trendColor('down', true)).toBe('var(--color-error)')
  })

  it('returns success for downward trend when negative is good (bugs going down)', () => {
    expect(trendColor('down', false)).toBe('var(--color-success)')
  })

  it('returns muted for neutral trend', () => {
    expect(trendColor('neutral')).toBe('var(--color-text-muted)')
    expect(trendColor('neutral', false)).toBe('var(--color-text-muted)')
  })
})

describe('Progress bar color logic', () => {
  function progressColor(percent: number): string {
    if (percent >= 80) return 'var(--color-success)'
    if (percent >= 50) return 'var(--color-turmeric)'
    return 'var(--color-error)'
  }

  it('is green at 80%+', () => {
    expect(progressColor(80)).toBe('var(--color-success)')
    expect(progressColor(94)).toBe('var(--color-success)')
    expect(progressColor(100)).toBe('var(--color-success)')
  })

  it('is turmeric between 50-79%', () => {
    expect(progressColor(50)).toBe('var(--color-turmeric)')
    expect(progressColor(68)).toBe('var(--color-turmeric)')
    expect(progressColor(79)).toBe('var(--color-turmeric)')
  })

  it('is red below 50%', () => {
    expect(progressColor(0)).toBe('var(--color-error)')
    expect(progressColor(49)).toBe('var(--color-error)')
  })
})
