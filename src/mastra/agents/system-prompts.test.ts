import { describe, it, expect } from 'vitest'
import { buildSystemPrompt, ROLE_PROMPTS } from './system-prompts'
import type { Role } from '@/types/roles'

describe('buildSystemPrompt', () => {
  it('returns a non-empty string for each role', () => {
    const roles: Role[] = ['admin', 'developer', 'qa', 'stakeholder']
    for (const role of roles) {
      const prompt = buildSystemPrompt(role)
      expect(prompt.length).toBeGreaterThan(50)
    }
  })

  it('admin prompt includes system access and user management context', () => {
    const prompt = buildSystemPrompt('admin')
    const lower = prompt.toLowerCase()
    expect(lower).toMatch(/admin|system|user management|administration/)
  })

  it('developer prompt includes technical depth and CI/CD context', () => {
    const prompt = buildSystemPrompt('developer')
    const lower = prompt.toLowerCase()
    expect(lower).toMatch(/technical|developer|ci\/cd|code|pipeline/)
  })

  it('qa prompt includes testing and quality metrics context', () => {
    const prompt = buildSystemPrompt('qa')
    const lower = prompt.toLowerCase()
    expect(lower).toMatch(/test|quality|bug|qa/)
  })

  it('stakeholder prompt includes business metrics context', () => {
    const prompt = buildSystemPrompt('stakeholder')
    const lower = prompt.toLowerCase()
    expect(lower).toMatch(/business|metric|stakeholder|overview|aggregate/)
  })

  it('stakeholder prompt excludes individual developer attribution', () => {
    const prompt = buildSystemPrompt('stakeholder')
    const lower = prompt.toLowerCase()
    // Stakeholder should NOT see individual developer names/attribution
    expect(lower).not.toMatch(/individual developer|who wrote|blame|author attribution/)
  })

  it('stakeholder prompt excludes code-level details instruction', () => {
    const prompt = buildSystemPrompt('stakeholder')
    // Should include explicit instruction to avoid code details
    const lower = prompt.toLowerCase()
    expect(lower).toMatch(/aggregate|do not|avoid|business|high.level/)
  })

  it('each role produces a distinct prompt', () => {
    const roles: Role[] = ['admin', 'developer', 'qa', 'stakeholder']
    const prompts = roles.map((r) => buildSystemPrompt(r))
    const unique = new Set(prompts)
    expect(unique.size).toBe(4)
  })
})

describe('ROLE_PROMPTS', () => {
  it('has entries for all four roles', () => {
    expect(ROLE_PROMPTS).toHaveProperty('admin')
    expect(ROLE_PROMPTS).toHaveProperty('developer')
    expect(ROLE_PROMPTS).toHaveProperty('qa')
    expect(ROLE_PROMPTS).toHaveProperty('stakeholder')
  })
})
