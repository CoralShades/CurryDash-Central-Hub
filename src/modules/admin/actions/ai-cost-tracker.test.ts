import { describe, it, expect } from 'vitest'
import { aiCostQuerySchema } from '../schemas/ai-cost-tracker-schema'

describe('AiCostTracker Schema Validation', () => {
  describe('aiCostQuerySchema', () => {
    it('accepts empty object (uses current month by default)', () => {
      const result = aiCostQuerySchema.safeParse({})
      expect(result.success).toBe(true)
    })

    it('accepts valid year and month', () => {
      const result = aiCostQuerySchema.safeParse({ year: 2026, month: 2 })
      expect(result.success).toBe(true)
    })

    it('accepts year-only filter', () => {
      const result = aiCostQuerySchema.safeParse({ year: 2026 })
      expect(result.success).toBe(true)
    })

    it('accepts month-only filter', () => {
      const result = aiCostQuerySchema.safeParse({ month: 12 })
      expect(result.success).toBe(true)
    })

    it('rejects year below 2024', () => {
      const result = aiCostQuerySchema.safeParse({ year: 2020 })
      expect(result.success).toBe(false)
    })

    it('rejects year above 2100', () => {
      const result = aiCostQuerySchema.safeParse({ year: 2200 })
      expect(result.success).toBe(false)
    })

    it('rejects month below 1', () => {
      const result = aiCostQuerySchema.safeParse({ month: 0 })
      expect(result.success).toBe(false)
    })

    it('rejects month above 12', () => {
      const result = aiCostQuerySchema.safeParse({ month: 13 })
      expect(result.success).toBe(false)
    })

    it('rejects non-integer year', () => {
      const result = aiCostQuerySchema.safeParse({ year: 2026.5 })
      expect(result.success).toBe(false)
    })

    it('rejects string year value', () => {
      const result = aiCostQuerySchema.safeParse({ year: '2026' })
      expect(result.success).toBe(false)
    })

    it('returns correct data shape on valid input', () => {
      const result = aiCostQuerySchema.safeParse({ year: 2026, month: 3 })
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.year).toBe(2026)
        expect(result.data.month).toBe(3)
      }
    })

    it('returns undefined for optional fields when omitted', () => {
      const result = aiCostQuerySchema.safeParse({})
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.year).toBeUndefined()
        expect(result.data.month).toBeUndefined()
      }
    })
  })
})
