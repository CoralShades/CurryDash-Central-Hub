import { describe, it, expect, vi } from 'vitest'

// Break next-auth → next/server import chain
vi.mock('@/lib/auth', () => ({ auth: vi.fn().mockResolvedValue(null), requireAuth: vi.fn() }))
vi.mock('@/lib/supabase/admin', () => ({ createAdminClient: vi.fn(() => ({})) }))
vi.mock('next/cache', () => ({ revalidateTag: vi.fn() }))
vi.mock('next/navigation', () => ({ useRouter: vi.fn(() => ({ refresh: vi.fn() })) }))
vi.mock('@/stores/use-dashboard-store', () => ({
  useDashboardStore: vi.fn(() => vi.fn()),
}))

describe('AiWidgetCard', () => {
  it('exports AiWidgetCard as a named export', async () => {
    const mod = await import('./ai-widget-card')
    expect(typeof mod.AiWidgetCard).toBe('function')
  })
})
