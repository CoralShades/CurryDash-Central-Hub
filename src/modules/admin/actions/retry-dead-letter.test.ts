import { describe, it, expect } from 'vitest'
import { retryEventSchema, bulkRetrySchema } from '../schemas/dead-letter-schema'

describe('Dead Letter Retry - Schema Validation', () => {
  describe('retryEventSchema', () => {
    it('validates valid event ID (UUID)', () => {
      const input = { eventId: '550e8400-e29b-41d4-a716-446655440000' }
      const result = retryEventSchema.safeParse(input)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.eventId).toBe('550e8400-e29b-41d4-a716-446655440000')
      }
    })

    it('rejects invalid UUID format', () => {
      const input = { eventId: 'not-a-uuid' }
      const result = retryEventSchema.safeParse(input)
      expect(result.success).toBe(false)
    })

    it('rejects empty eventId string', () => {
      const input = { eventId: '' }
      const result = retryEventSchema.safeParse(input)
      expect(result.success).toBe(false)
    })

    it('requires eventId field', () => {
      const input = {}
      const result = retryEventSchema.safeParse(input)
      expect(result.success).toBe(false)
    })

    it('rejects numeric eventId', () => {
      const input = { eventId: 12345 }
      const result = retryEventSchema.safeParse(input)
      expect(result.success).toBe(false)
    })
  })

  describe('bulkRetrySchema', () => {
    it('validates empty object', () => {
      const result = bulkRetrySchema.safeParse({})
      expect(result.success).toBe(true)
    })

    it('validates with extra fields stripped (no strict mode)', () => {
      const result = bulkRetrySchema.safeParse({ unexpected: 'value' })
      expect(result.success).toBe(true)
    })

    it('validates undefined input as object', () => {
      const result = bulkRetrySchema.safeParse(null)
      expect(result.success).toBe(false)
    })
  })
})
