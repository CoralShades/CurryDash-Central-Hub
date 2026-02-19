import { describe, it, expect } from 'vitest'
import { markAsReadSchema } from '../schemas/notification-schema'

describe('Notification Actions - Schema Validation', () => {
  describe('markAsRead validation', () => {
    it('validates a valid UUID', () => {
      const input = { notificationId: '550e8400-e29b-41d4-a716-446655440000' }
      const result = markAsReadSchema.safeParse(input)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.notificationId).toBe('550e8400-e29b-41d4-a716-446655440000')
      }
    })

    it('rejects an invalid UUID', () => {
      const input = { notificationId: 'not-a-uuid' }
      const result = markAsReadSchema.safeParse(input)
      expect(result.success).toBe(false)
    })

    it('rejects an empty string', () => {
      const input = { notificationId: '' }
      const result = markAsReadSchema.safeParse(input)
      expect(result.success).toBe(false)
    })

    it('requires notificationId', () => {
      const result = markAsReadSchema.safeParse({})
      expect(result.success).toBe(false)
    })

    it('rejects null', () => {
      const result = markAsReadSchema.safeParse({ notificationId: null })
      expect(result.success).toBe(false)
    })
  })
})
