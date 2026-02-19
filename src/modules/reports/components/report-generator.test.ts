import { describe, it, expect } from 'vitest'
import * as module from './report-generator'

describe('report-generator exports', () => {
  it('exports ReportGenerator component', () => {
    expect(module.ReportGenerator).toBeDefined()
  })

  it('exports PROGRESS_SUMMARY_PROMPT constant', () => {
    expect(typeof module.PROGRESS_SUMMARY_PROMPT).toBe('string')
    expect(module.PROGRESS_SUMMARY_PROMPT.length).toBeGreaterThan(10)
  })
})
