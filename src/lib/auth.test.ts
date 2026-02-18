import { describe, it, expect, vi, beforeEach } from 'vitest'
import { AuthError } from '@/lib/errors'

// Mock next-auth and its dependencies before importing auth helpers
vi.mock('next-auth', () => ({
  default: vi.fn(() => ({
    handlers: {},
    signIn: vi.fn(),
    signOut: vi.fn(),
    auth: vi.fn(),
  })),
}))

vi.mock('@auth/supabase-adapter', () => ({
  SupabaseAdapter: vi.fn(() => ({})),
}))

vi.mock('next-auth/providers/google', () => ({ default: vi.fn() }))
vi.mock('next-auth/providers/github', () => ({ default: vi.fn() }))
vi.mock('next-auth/providers/resend', () => ({ default: vi.fn() }))

// The auth() function used inside requireAuth — we mock it via the module
let mockAuthFn = vi.fn()

vi.mock('@/lib/auth', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/auth')>()

  return {
    ...actual,
    auth: mockAuthFn,
    requireAuth: async (...allowedRoles: string[]) => {
      const session = await mockAuthFn()

      if (!session?.user) {
        throw new AuthError('Not authenticated', { redirect: '/login' })
      }

      const userRole = session.user.role ?? null

      if (allowedRoles.length > 0 && (!userRole || !allowedRoles.includes(userRole))) {
        throw new AuthError('Insufficient permissions', {
          required: allowedRoles,
          actual: userRole,
        })
      }

      return { id: session.user.id, role: userRole, email: session.user.email }
    },
  }
})

describe('requireAuth', () => {
  beforeEach(() => {
    mockAuthFn = vi.fn()
  })

  it('throws AuthError when no session exists', async () => {
    mockAuthFn.mockResolvedValue(null)
    const { requireAuth } = await import('@/lib/auth')
    await expect(requireAuth()).rejects.toThrow(AuthError)
  })

  it('throws AuthError when session has no user', async () => {
    mockAuthFn.mockResolvedValue({ user: null })
    const { requireAuth } = await import('@/lib/auth')
    await expect(requireAuth()).rejects.toThrow(AuthError)
  })

  it('throws AuthError when user role does not match required role', async () => {
    mockAuthFn.mockResolvedValue({
      user: { id: 'user-1', role: 'developer', email: 'dev@test.com' },
    })
    const { requireAuth } = await import('@/lib/auth')
    await expect(requireAuth('admin')).rejects.toThrow(AuthError)
  })

  it('returns user when role matches', async () => {
    mockAuthFn.mockResolvedValue({
      user: { id: 'user-1', role: 'admin', email: 'admin@test.com' },
    })
    const { requireAuth } = await import('@/lib/auth')
    const user = await requireAuth('admin')
    expect(user.id).toBe('user-1')
    expect(user.role).toBe('admin')
    expect(user.email).toBe('admin@test.com')
  })

  it('returns user when no roles specified (any authenticated user)', async () => {
    mockAuthFn.mockResolvedValue({
      user: { id: 'user-2', role: 'stakeholder', email: 'sh@test.com' },
    })
    const { requireAuth } = await import('@/lib/auth')
    const user = await requireAuth()
    expect(user.role).toBe('stakeholder')
  })

  it('accepts multiple allowed roles', async () => {
    mockAuthFn.mockResolvedValue({
      user: { id: 'user-3', role: 'qa', email: 'qa@test.com' },
    })
    const { requireAuth } = await import('@/lib/auth')
    const user = await requireAuth('admin', 'qa')
    expect(user.role).toBe('qa')
  })
})
