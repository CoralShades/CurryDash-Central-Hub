import { describe, it, expect } from 'vitest'
import * as module from './report-viewer'

describe('report-viewer exports', () => {
  it('exports ReportViewer component', () => {
    expect(module.ReportViewer).toBeDefined()
  })
})
