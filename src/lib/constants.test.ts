import { describe, it, expect } from 'vitest'
import { STALENESS_AMBER_MS, STALENESS_RED_MS, STALENESS_SECONDARY_MS } from '@/lib/constants'

describe('Staleness constants', () => {
  it('STALENESS_SECONDARY_MS is 2 minutes', () => {
    expect(STALENESS_SECONDARY_MS).toBe(2 * 60 * 1000)
  })

  it('STALENESS_AMBER_MS is 10 minutes', () => {
    expect(STALENESS_AMBER_MS).toBe(10 * 60 * 1000)
  })

  it('STALENESS_RED_MS is 30 minutes', () => {
    expect(STALENESS_RED_MS).toBe(30 * 60 * 1000)
  })
})
