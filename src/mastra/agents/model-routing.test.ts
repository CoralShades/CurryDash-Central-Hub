import { describe, it, expect } from 'vitest'
import {
  selectModel,
  isSessionCapExceeded,
  SESSION_TOKEN_CAP,
  MAX_TOKENS_PER_CALL,
  HAIKU_MODEL_ID,
  SONNET_MODEL_ID,
  estimateTokenCost,
} from './model-routing'

describe('model routing constants', () => {
  it('MAX_TOKENS_PER_CALL is 4000 for cost control', () => {
    expect(MAX_TOKENS_PER_CALL).toBe(4000)
  })

  it('SESSION_TOKEN_CAP is 8000 tokens per session', () => {
    expect(SESSION_TOKEN_CAP).toBe(8000)
  })

  it('HAIKU_MODEL_ID uses the claude-haiku model', () => {
    expect(HAIKU_MODEL_ID).toContain('haiku')
  })

  it('SONNET_MODEL_ID uses the claude-sonnet model', () => {
    expect(SONNET_MODEL_ID).toContain('sonnet')
  })
})

describe('selectModel', () => {
  it('routes simple queries to Haiku', () => {
    expect(selectModel('simple')).toBe(HAIKU_MODEL_ID)
  })

  it('routes complex queries to Sonnet', () => {
    expect(selectModel('complex')).toBe(SONNET_MODEL_ID)
  })

  it('routes report generation to Sonnet', () => {
    expect(selectModel('report')).toBe(SONNET_MODEL_ID)
  })

  it('routes status checks to Haiku', () => {
    expect(selectModel('status_check')).toBe(HAIKU_MODEL_ID)
  })

  it('routes data lookups to Haiku', () => {
    expect(selectModel('data_lookup')).toBe(HAIKU_MODEL_ID)
  })

  it('routes multi-tool analysis to Sonnet', () => {
    expect(selectModel('multi_tool_analysis')).toBe(SONNET_MODEL_ID)
  })

  it('routes widget creation to Sonnet', () => {
    expect(selectModel('widget_creation')).toBe(SONNET_MODEL_ID)
  })
})

describe('isSessionCapExceeded', () => {
  it('returns false below cap', () => {
    expect(isSessionCapExceeded(0)).toBe(false)
    expect(isSessionCapExceeded(4000)).toBe(false)
    expect(isSessionCapExceeded(7999)).toBe(false)
  })

  it('returns true at exactly the cap', () => {
    expect(isSessionCapExceeded(8000)).toBe(true)
  })

  it('returns true above cap', () => {
    expect(isSessionCapExceeded(8001)).toBe(true)
    expect(isSessionCapExceeded(10000)).toBe(true)
  })
})

describe('estimateTokenCost', () => {
  it('returns a positive number for Haiku', () => {
    const cost = estimateTokenCost(HAIKU_MODEL_ID, 1000)
    expect(cost).toBeGreaterThan(0)
  })

  it('returns a positive number for Sonnet', () => {
    const cost = estimateTokenCost(SONNET_MODEL_ID, 1000)
    expect(cost).toBeGreaterThan(0)
  })

  it('Sonnet costs more than Haiku for same token count', () => {
    const haikuCost = estimateTokenCost(HAIKU_MODEL_ID, 1000)
    const sonnetCost = estimateTokenCost(SONNET_MODEL_ID, 1000)
    expect(sonnetCost).toBeGreaterThan(haikuCost)
  })

  it('cost scales with token count', () => {
    const smallCost = estimateTokenCost(HAIKU_MODEL_ID, 100)
    const largeCost = estimateTokenCost(HAIKU_MODEL_ID, 1000)
    expect(largeCost).toBeGreaterThan(smallCost)
  })

  it('returns 0 for zero tokens', () => {
    expect(estimateTokenCost(HAIKU_MODEL_ID, 0)).toBe(0)
  })
})
