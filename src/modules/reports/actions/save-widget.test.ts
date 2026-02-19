import { describe, it, expect, vi } from 'vitest'

// Mock auth and supabase to avoid ESM/next-auth issues in tests
vi.mock('@/lib/auth', () => ({
  auth: vi.fn().mockResolvedValue(null),
}))
vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: vi.fn(() => ({
    from: vi.fn(() => ({
      insert: vi.fn(() => ({
        select: vi.fn(() => ({
          single: vi.fn().mockResolvedValue({ data: { id: 'widget-123' }, error: null }),
        })),
      })),
    })),
  })),
}))

const validConfig = {
  type: 'bar-chart' as const,
  title: 'Bugs by Priority',
  dataSource: 'jira' as const,
  query: 'project = CUR AND type = Bug',
  colSpan: 6 as const,
  refreshBehavior: 'realtime' as const,
}

describe('saveWidget', () => {
  it('exports saveWidget as a function', async () => {
    const mod = await import('./save-widget')
    expect(typeof mod.saveWidget).toBe('function')
  })

  it('returns AUTH_REQUIRED when not authenticated', async () => {
    const mod = await import('./save-widget')
    const result = await mod.saveWidget(validConfig)
    expect(result.data).toBeNull()
    expect(result.error?.code).toBe('AUTH_REQUIRED')
  })

  it('returns VALIDATION_ERROR for invalid config', async () => {
    const { auth } = await import('@/lib/auth')
    vi.mocked(auth).mockResolvedValueOnce({
      // @ts-expect-error — auth overloads; picks session-returning overload
      user: { id: 'user-1', role: 'developer', email: 'dev@test.com' },
      expires: '2026-01-01',
    })

    const mod = await import('./save-widget')
    const result = await mod.saveWidget({
      ...validConfig,
      type: 'invalid-type' as 'bar-chart',
    })
    expect(result.data).toBeNull()
    expect(result.error?.code).toBe('VALIDATION_ERROR')
  })

  it('returns VALIDATION_ERROR for empty title', async () => {
    const { auth } = await import('@/lib/auth')
    vi.mocked(auth).mockResolvedValueOnce({
      // @ts-expect-error — auth overloads; picks session-returning overload
      user: { id: 'user-1', role: 'developer', email: 'dev@test.com' },
      expires: '2026-01-01',
    })

    const mod = await import('./save-widget')
    const result = await mod.saveWidget({ ...validConfig, title: '' })
    expect(result.data).toBeNull()
    expect(result.error?.code).toBe('VALIDATION_ERROR')
  })
})
