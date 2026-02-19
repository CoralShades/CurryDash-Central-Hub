import { describe, it, expect } from 'vitest'
import { createReportAgent } from './report-agent'

describe('createReportAgent', () => {
  it('creates an agent for developer role', () => {
    const agent = createReportAgent('developer')
    expect(agent).toBeDefined()
  })

  it('creates an agent for stakeholder role', () => {
    const agent = createReportAgent('stakeholder')
    expect(agent).toBeDefined()
  })

  it('agent includes sprint report data tool', () => {
    const agent = createReportAgent('developer')
    expect(agent.tools).toHaveProperty('getSprintReportData')
  })

  it('agent includes queue report retry tool', () => {
    const agent = createReportAgent('developer')
    expect(agent.tools).toHaveProperty('queueReportRetry')
  })

  it('agent name is report-agent', () => {
    const agent = createReportAgent('developer')
    expect(agent.name).toBe('report-agent')
  })
})
