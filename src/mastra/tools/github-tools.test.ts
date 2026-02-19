import { describe, it, expect } from 'vitest'
import { getPullRequestsTool, getWorkflowRunsTool } from './github-tools'

describe('getPullRequestsTool', () => {
  it('has a description', () => {
    expect(typeof getPullRequestsTool.description).toBe('string')
    expect(getPullRequestsTool.description.length).toBeGreaterThan(10)
  })

  it('has an execute function', () => {
    expect(typeof getPullRequestsTool.execute).toBe('function')
  })

  it('has an inputSchema', () => {
    expect(getPullRequestsTool.inputSchema).toBeDefined()
  })

  it('inputSchema accepts valid input', () => {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const result = getPullRequestsTool.inputSchema!.safeParse({
      state: 'open',
      limit: 10,
    })
    expect(result.success).toBe(true)
  })

  it('inputSchema accepts empty input (all optional)', () => {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const result = getPullRequestsTool.inputSchema!.safeParse({})
    expect(result.success).toBe(true)
  })

  it('inputSchema rejects invalid state', () => {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const result = getPullRequestsTool.inputSchema!.safeParse({
      state: 'invalid-state',
    })
    expect(result.success).toBe(false)
  })

  it('inputSchema accepts optional sessionTokens for budget check', () => {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const result = getPullRequestsTool.inputSchema!.safeParse({
      state: 'open',
      sessionTokens: 3000,
    })
    expect(result.success).toBe(true)
  })

  it('description mentions live query and source citation', () => {
    const desc = getPullRequestsTool.description
    expect(desc).toMatch(/live|cache|source/i)
  })
})

describe('getWorkflowRunsTool', () => {
  it('has a description', () => {
    expect(typeof getWorkflowRunsTool.description).toBe('string')
    expect(getWorkflowRunsTool.description.length).toBeGreaterThan(10)
  })

  it('has an execute function', () => {
    expect(typeof getWorkflowRunsTool.execute).toBe('function')
  })

  it('has an inputSchema', () => {
    expect(getWorkflowRunsTool.inputSchema).toBeDefined()
  })

  it('inputSchema accepts valid input', () => {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const result = getWorkflowRunsTool.inputSchema!.safeParse({
      limit: 20,
    })
    expect(result.success).toBe(true)
  })

  it('inputSchema accepts optional sessionTokens for budget check', () => {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const result = getWorkflowRunsTool.inputSchema!.safeParse({
      sessionTokens: 5000,
    })
    expect(result.success).toBe(true)
  })
})
