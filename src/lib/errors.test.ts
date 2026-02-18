import { describe, it, expect } from 'vitest'
import { AppError, AuthError, IntegrationError, ValidationError, RateLimitError } from '@/lib/errors'

describe('Error classes', () => {
  it('AppError has correct code and message', () => {
    const err = new AppError('TEST_CODE', 'test message')
    expect(err.code).toBe('TEST_CODE')
    expect(err.message).toBe('test message')
    expect(err instanceof Error).toBe(true)
  })

  it('AuthError has AUTH_ERROR code', () => {
    const err = new AuthError('unauthorized')
    expect(err.code).toBe('AUTH_ERROR')
    expect(err.name).toBe('AuthError')
  })

  it('IntegrationError has INTEGRATION_ERROR code', () => {
    const err = new IntegrationError('jira down')
    expect(err.code).toBe('INTEGRATION_ERROR')
    expect(err.name).toBe('IntegrationError')
  })

  it('ValidationError has VALIDATION_ERROR code', () => {
    const err = new ValidationError('invalid input')
    expect(err.code).toBe('VALIDATION_ERROR')
    expect(err.name).toBe('ValidationError')
  })

  it('RateLimitError has RATE_LIMIT_ERROR code', () => {
    const err = new RateLimitError('too many requests')
    expect(err.code).toBe('RATE_LIMIT_ERROR')
    expect(err.name).toBe('RateLimitError')
  })

  it('supports optional data payload', () => {
    const data = { field: 'email', value: 'bad' }
    const err = new ValidationError('invalid', data)
    expect(err.data).toEqual(data)
  })
})
