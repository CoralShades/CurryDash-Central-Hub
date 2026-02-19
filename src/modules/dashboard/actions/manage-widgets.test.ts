import { describe, it, expect, vi } from 'vitest'

vi.mock('@/lib/auth', () => ({
  auth: vi.fn().mockResolvedValue(null),
}))

vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: vi.fn(() => ({
    from: vi.fn(() => ({
      update: vi.fn(() => ({
        eq: vi.fn(() => ({
          eq: vi.fn(() => ({
            select: vi.fn(() => ({
              single: vi.fn().mockResolvedValue({ data: { id: 'widget-123' }, error: null }),
            })),
          })),
        })),
      })),
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          is: vi.fn(() => ({
            order: vi.fn().mockResolvedValue({ data: [], error: null }),
          })),
        })),
      })),
    })),
  })),
}))

vi.mock('next/cache', () => ({
  revalidateTag: vi.fn(),
}))

describe('deleteWidget', () => {
  it('exports deleteWidget as a function', async () => {
    const mod = await import('./manage-widgets')
    expect(typeof mod.deleteWidget).toBe('function')
  })

  it('returns AUTH_REQUIRED when not authenticated', async () => {
    const mod = await import('./manage-widgets')
    const result = await mod.deleteWidget('widget-123')
    expect(result.data).toBeNull()
    expect(result.error?.code).toBe('AUTH_REQUIRED')
  })

  it('returns success and widget id when authenticated and widget owned by user', async () => {
    const { auth } = await import('@/lib/auth')
    vi.mocked(auth).mockResolvedValueOnce({
      // @ts-expect-error — auth overloads; picks session-returning overload
      user: { id: 'user-1', role: 'developer', email: 'dev@test.com' },
      expires: '2026-01-01',
    })

    const mod = await import('./manage-widgets')
    const result = await mod.deleteWidget('widget-123')
    expect(result.error).toBeNull()
    expect(result.data?.id).toBe('widget-123')
  })
})

describe('regenerateWidget', () => {
  it('exports regenerateWidget as a function', async () => {
    const mod = await import('./manage-widgets')
    expect(typeof mod.regenerateWidget).toBe('function')
  })

  it('returns AUTH_REQUIRED when not authenticated', async () => {
    const mod = await import('./manage-widgets')
    const result = await mod.regenerateWidget('widget-123')
    expect(result.data).toBeNull()
    expect(result.error?.code).toBe('AUTH_REQUIRED')
  })
})

describe('getUserWidgets', () => {
  it('exports getUserWidgets as a function', async () => {
    const mod = await import('./manage-widgets')
    expect(typeof mod.getUserWidgets).toBe('function')
  })

  it('returns AUTH_REQUIRED when not authenticated', async () => {
    const mod = await import('./manage-widgets')
    const result = await mod.getUserWidgets('user-1')
    expect(result.data).toBeNull()
    expect(result.error?.code).toBe('AUTH_REQUIRED')
  })

  it('returns empty list when user has no AI widgets', async () => {
    const { auth } = await import('@/lib/auth')
    vi.mocked(auth).mockResolvedValueOnce({
      // @ts-expect-error — auth overloads; picks session-returning overload
      user: { id: 'user-1', role: 'developer', email: 'dev@test.com' },
      expires: '2026-01-01',
    })

    const mod = await import('./manage-widgets')
    const result = await mod.getUserWidgets('user-1')
    expect(result.error).toBeNull()
    expect(Array.isArray(result.data)).toBe(true)
  })
})
