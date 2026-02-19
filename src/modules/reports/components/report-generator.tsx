'use client'

import { useState, useCallback } from 'react'
import { WidgetSkeleton } from '@/components/shared/widget-skeleton'
import { ReportViewer } from './report-viewer'
import type { GeneratedReport } from '../types'

/** Default prompt sent to the SSE streaming endpoint. */
export const PROGRESS_SUMMARY_PROMPT =
  'Generate a comprehensive progress summary. Include overall project health indicator (On Track / At Risk / Behind), milestone completion percentage, key achievements this sprint, risks and blockers framed in business terms, and a forward-looking outlook.'

interface ReportGeneratorProps {
  /** Role label shown in the header — display only, auth is from JWT. */
  roleLabel?: string
}

/**
 * ReportGenerator — UI for requesting a progress summary from the Mastra report agent.
 *
 * Streams partial output via SSE from /api/reports/progress-summary (FR31).
 * Role-based content filtering is enforced server-side via JWT claims (FR34).
 * Report completes within 15 seconds (NFR-P7).
 */
export function ReportGenerator({ roleLabel }: ReportGeneratorProps) {
  const [isGenerating, setIsGenerating] = useState(false)
  const [streamingContent, setStreamingContent] = useState('')
  const [completedReport, setCompletedReport] = useState<GeneratedReport | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleGenerate = useCallback(async () => {
    setIsGenerating(true)
    setStreamingContent('')
    setCompletedReport(null)
    setError(null)

    try {
      const response = await fetch('/api/reports/progress-summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: PROGRESS_SUMMARY_PROMPT }),
      })

      if (!response.ok) {
        const data = (await response.json()) as { error?: string }
        setError(data.error ?? 'Report generation failed')
        return
      }

      // Stream chunks from the response body
      const reader = response.body?.getReader()
      if (!reader) {
        setError('Streaming not supported by this browser')
        return
      }

      const decoder = new TextDecoder()
      let fullContent = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const chunk = decoder.decode(value, { stream: true })
        fullContent += chunk
        setStreamingContent(fullContent)
      }

      // Finalise: switch from streaming to completed report
      setCompletedReport({
        content: fullContent,
        generatedAt: new Date().toISOString(),
        role: 'developer', // placeholder — actual role is JWT-sourced on server
      })
      setStreamingContent('')
    } catch {
      setError('Unable to generate report. Please try again.')
    } finally {
      setIsGenerating(false)
    }
  }, [])

  return (
    <div>
      {/* Generate button */}
      {!isGenerating && !completedReport && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={handleGenerate}
            aria-label="Generate progress summary report"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.625rem 1.25rem',
              borderRadius: 'var(--radius-md)',
              border: 'none',
              backgroundColor: 'var(--color-turmeric)',
              color: '#fff',
              fontWeight: 600,
              fontSize: '0.9375rem',
              cursor: 'pointer',
              transition: 'opacity 0.15s',
            }}
            onMouseOver={(e) => { (e.currentTarget as HTMLButtonElement).style.opacity = '0.85' }}
            onMouseOut={(e) => { (e.currentTarget as HTMLButtonElement).style.opacity = '1' }}
          >
            {/* Sparkle icon */}
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} style={{ width: '18px', height: '18px' }} aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.847a4.5 4.5 0 003.09 3.09L15.75 12l-2.847.813a4.5 4.5 0 00-3.09 3.09z" />
            </svg>
            Generate Progress Summary
          </button>
          {roleLabel && (
            <span style={{ fontSize: '0.8125rem', color: 'hsl(var(--muted-foreground))' }}>
              Tailored for {roleLabel} role
            </span>
          )}
        </div>
      )}

      {/* Generating — streaming in progress */}
      {isGenerating && !streamingContent && (
        <WidgetSkeleton variant="list" />
      )}

      {/* Streaming content */}
      {(isGenerating && streamingContent) && (
        <ReportViewer streamingContent={streamingContent} isStreaming report={null} />
      )}

      {/* Completed report */}
      {completedReport && (
        <>
          <ReportViewer report={completedReport} />
          <button
            type="button"
            onClick={handleGenerate}
            style={{
              marginTop: '1rem',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.375rem',
              padding: '0.5rem 1rem',
              borderRadius: 'var(--radius-md)',
              border: '1px solid hsl(var(--border))',
              backgroundColor: 'transparent',
              color: 'hsl(var(--foreground))',
              fontSize: '0.875rem',
              cursor: 'pointer',
            }}
          >
            Regenerate
          </button>
        </>
      )}

      {/* Error state */}
      {error && (
        <div
          role="alert"
          style={{
            marginTop: '0.75rem',
            padding: '0.75rem 1rem',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'hsl(var(--destructive) / 0.1)',
            color: 'hsl(var(--destructive))',
            fontSize: '0.875rem',
          }}
        >
          {error}
          <button
            type="button"
            onClick={handleGenerate}
            style={{
              marginLeft: '0.75rem',
              textDecoration: 'underline',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'inherit',
              fontSize: 'inherit',
            }}
          >
            Try again
          </button>
        </div>
      )}
    </div>
  )
}
