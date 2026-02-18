import { describe, it, expect } from 'vitest'
import { createUserSchema, updateUserSchema, deactivateUserSchema } from '../schemas/user-schema'

describe('User Management Actions - Schema Validation', () => {
  describe('createUser validation', () => {
    it('validates valid create user input', () => {
      const input = {
        email: 'user@example.com',
        role: 'developer',
      }
      const result = createUserSchema.safeParse(input)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.email).toBe('user@example.com')
        expect(result.data.role).toBe('developer')
      }
    })

    it('rejects invalid email', () => {
      const input = {
        email: 'invalid-email',
        role: 'admin',
      }
      const result = createUserSchema.safeParse(input)
      expect(result.success).toBe(false)
    })

    it('rejects invalid role', () => {
      const input = {
        email: 'user@example.com',
        role: 'invalid-role',
      }
      const result = createUserSchema.safeParse(input)
      expect(result.success).toBe(false)
    })

    it('requires email', () => {
      const input = {
        role: 'developer',
      }
      const result = createUserSchema.safeParse(input)
      expect(result.success).toBe(false)
    })

    it('requires role', () => {
      const input = {
        email: 'user@example.com',
      }
      const result = createUserSchema.safeParse(input)
      expect(result.success).toBe(false)
    })
  })

  describe('updateUser validation', () => {
    it('validates valid update user input', () => {
      const input = {
        userId: '550e8400-e29b-41d4-a716-446655440000',
        role: 'admin',
      }
      const result = updateUserSchema.safeParse(input)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.userId).toBe('550e8400-e29b-41d4-a716-446655440000')
        expect(result.data.role).toBe('admin')
      }
    })

    it('rejects invalid UUID', () => {
      const input = {
        userId: 'not-a-uuid',
        role: 'developer',
      }
      const result = updateUserSchema.safeParse(input)
      expect(result.success).toBe(false)
    })

    it('rejects invalid role', () => {
      const input = {
        userId: '550e8400-e29b-41d4-a716-446655440000',
        role: 'invalid-role',
      }
      const result = updateUserSchema.safeParse(input)
      expect(result.success).toBe(false)
    })

    it('requires userId', () => {
      const input = {
        role: 'qa',
      }
      const result = updateUserSchema.safeParse(input)
      expect(result.success).toBe(false)
    })

    it('requires role', () => {
      const input = {
        userId: '550e8400-e29b-41d4-a716-446655440000',
      }
      const result = updateUserSchema.safeParse(input)
      expect(result.success).toBe(false)
    })
  })

  describe('deactivateUser validation', () => {
    it('validates valid deactivate user input', () => {
      const input = {
        userId: '550e8400-e29b-41d4-a716-446655440000',
      }
      const result = deactivateUserSchema.safeParse(input)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.userId).toBe('550e8400-e29b-41d4-a716-446655440000')
      }
    })

    it('rejects invalid UUID', () => {
      const input = {
        userId: 'not-a-uuid',
      }
      const result = deactivateUserSchema.safeParse(input)
      expect(result.success).toBe(false)
    })

    it('requires userId', () => {
      const input = {}
      const result = deactivateUserSchema.safeParse(input)
      expect(result.success).toBe(false)
    })
  })
})
