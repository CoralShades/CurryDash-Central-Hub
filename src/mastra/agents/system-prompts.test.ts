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

  it('stakeholder prompt instructs the AI not to attribute work to individual developers', () => {
    const prompt = buildSystemPrompt('stakeholder')
    const lower = prompt.toLowerCase()
    // Should explicitly instruct NOT to show per-person breakdowns or developer names
    expect(lower).toMatch(/no individual developer|per-person|avoid attributing|team.level/)
    // Should NOT instruct: "show developer X did Y" type attributions
    expect(lower).not.toMatch(/who wrote|blame|author attribution/)
  })

  it('stakeholder prompt excludes code-level details instruction', () => {
    const prompt = buildSystemPrompt('stakeholder')
    // Should include explicit instruction to avoid code details
    const lower = prompt.toLowerCase()
    expect(lower).toMatch(/aggregate|do not|avoid|business|high.level/)
  })

  it('stakeholder prompt explicitly prohibits code snippets and GitHub code links', () => {
    const prompt = buildSystemPrompt('stakeholder')
    const lower = prompt.toLowerCase()
    expect(lower).toMatch(/code snippet|github.*link|code.*link|no code|never.*code/)
  })

  it('stakeholder prompt explicitly prohibits individual developer names', () => {
    const prompt = buildSystemPrompt('stakeholder')
    const lower = prompt.toLowerCase()
    expect(lower).toMatch(/individual developer|developer name|per-person|no.*name/)
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
