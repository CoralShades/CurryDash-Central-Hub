import { describe, it, expect, vi } from 'vitest'

// Mock CopilotKit to avoid ESM issues in tests
vi.mock('@copilotkit/react-core', () => ({
  CopilotKit: ({ children }: { children: React.ReactNode }) => children,
  useCopilotReadable: vi.fn(),
  useCopilotAction: vi.fn(),
}))
vi.mock('@copilotkit/react-ui', () => ({
  CopilotChat: () => null,
  CopilotSidebar: () => null,
}))
vi.mock('@/stores/use-dashboard-store', () => ({
  useDashboardStore: vi.fn(() => ({
    isAiSidebarOpen: false,
    closeAiSidebar: vi.fn(),
    openAiSidebar: vi.fn(),
    toggleAiSidebar: vi.fn(),
  })),
  useAiSidebar: vi.fn(() => ({ isOpen: false, toggle: vi.fn() })),
}))

import type React from 'react'

describe('AI module — copilot-provider', () => {
  it('exports CopilotProvider component', async () => {
    const mod = await import('./copilot-provider')
    expect(typeof mod.CopilotProvider).toBe('function')
  })
})

describe('AI module — ai-status', () => {
  it('exports AiStatus component', async () => {
    const mod = await import('./ai-status')
    expect(typeof mod.AiStatus).toBe('function')
  })
})

describe('AI module — ai-sidebar', () => {
  it('exports AiSidebar component', async () => {
    const mod = await import('./ai-sidebar')
    expect(typeof mod.AiSidebar).toBe('function')
  })
})

describe('AI module — use-copilot-context', () => {
  it('exports useCopilotContext hook', async () => {
    const mod = await import('./use-copilot-context')
    expect(typeof mod.useCopilotContext).toBe('function')
  })
})

describe('AI module — use-copilot-actions', () => {
  it('exports useCopilotActions hook', async () => {
    const mod = await import('./use-copilot-actions')
    expect(typeof mod.useCopilotActions).toBe('function')
  })
})

describe('CopilotProvider configuration', () => {
  it('uses correct runtime URL path', async () => {
    const mod = await import('./copilot-provider')
    expect(mod.COPILOTKIT_RUNTIME_URL).toBe('/api/ai/copilotkit')
  })
})

describe('AiSidebar width', () => {
  it('exports AI_SIDEBAR_WIDTH constant as 400', async () => {
    const mod = await import('./ai-sidebar')
    expect(mod.AI_SIDEBAR_WIDTH).toBe(400)
  })
})

describe('AiStatus message', () => {
  it('exports AI_UNAVAILABLE_MESSAGE constant', async () => {
    const mod = await import('./ai-status')
    expect(mod.AI_UNAVAILABLE_MESSAGE).toBe('AI assistant is temporarily unavailable')
  })
})

describe('AiSidebar unavailability fallback', () => {
  it('exports AI_UNAVAILABLE_FALLBACK constant', async () => {
    const mod = await import('./ai-sidebar')
    expect(typeof mod.AI_UNAVAILABLE_FALLBACK).toBe('string')
    expect(mod.AI_UNAVAILABLE_FALLBACK.length).toBeGreaterThan(20)
  })
})
