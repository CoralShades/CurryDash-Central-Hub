import { describe, it, expect } from 'vitest'
import { getActiveSprintIssuesTool, getJiraProjectsSummaryTool } from './jira-tools'

describe('getActiveSprintIssuesTool', () => {
  it('has a description', () => {
    expect(typeof getActiveSprintIssuesTool.description).toBe('string')
    expect(getActiveSprintIssuesTool.description.length).toBeGreaterThan(10)
  })

  it('has an execute function', () => {
    expect(typeof getActiveSprintIssuesTool.execute).toBe('function')
  })

  it('has an inputSchema', () => {
    expect(getActiveSprintIssuesTool.inputSchema).toBeDefined()
  })

  it('inputSchema accepts a valid projectKey', () => {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const result = getActiveSprintIssuesTool.inputSchema!.safeParse({
      projectKey: 'CD',
    })
    expect(result.success).toBe(true)
  })

  it('inputSchema rejects missing projectKey', () => {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const result = getActiveSprintIssuesTool.inputSchema!.safeParse({})
    expect(result.success).toBe(false)
  })
})

describe('getJiraProjectsSummaryTool', () => {
  it('has a description', () => {
    expect(typeof getJiraProjectsSummaryTool.description).toBe('string')
    expect(getJiraProjectsSummaryTool.description.length).toBeGreaterThan(10)
  })

  it('has an execute function', () => {
    expect(typeof getJiraProjectsSummaryTool.execute).toBe('function')
  })
})
